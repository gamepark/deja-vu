import { isMoveItemType, isMoveItemTypeAtOnce, ItemMove, MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { dejaVuCardsData, DejaVuCard, DejaVuCardId, endCard } from '../material/DejaVuCard'
import { BONUS_TOKEN_THRESHOLD, TERMINATE_MIN_OCCURRENCES } from '../GameConstants'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { RuleId } from './RuleId'
import { EndGameHelper } from './helper/EndGameHelper'

export class RevealCardRule extends PlayerTurnRule {
  getPlayerMoves(): MaterialMove[] {
    const moves: MaterialMove[] = []

    moves.push(...this.material(MaterialType.DejaVuCard).location(LocationType.Grid).rotation(r => !r).rotateItems(true))

    const topDeckCard = this.material(MaterialType.DejaVuCard).location(LocationType.Deck).maxBy(item => item.location.x ?? 0)
    const topDeckItem = topDeckCard.getItem<DejaVuCardId>()
    // The End card is identified by its back (= endCard): its front is hidden while face down, but the
    // back is always visible, so this stays deterministic between the server and the acting player's view.
    if (topDeckCard.length && !topDeckItem?.location.rotation && topDeckItem?.id.back !== endCard) {
      moves.push(topDeckCard.rotateItem(true))
    }

    if (this.canTerminate) {
      // Terminate = scoop up every revealed card at once into the player's pile.
      moves.push(
        this.material(MaterialType.DejaVuCard)
          .location(location => location.type === LocationType.Grid || location.type === LocationType.Deck)
          .rotation(true)
          .moveItemsAtOnce({ type: LocationType.PlayerPile, player: this.player })
      )
    }

    return moves
  }

  // All terminate consequences are computed BEFORE the cards leave the table: refill, bonus and the
  // end-of-turn decision all depend on the revealed cards (their fronts are public only while
  // face-up). beforeItemMove is computed pre-collect but its moves still play after it, preserving
  // the original order: refill the grid, grant the bonus, then end the turn.
  beforeItemMove(move: ItemMove): MaterialMove[] {
    if (!isMoveItemTypeAtOnce(MaterialType.DejaVuCard)(move)) return []

    const refillMoves = this.refillGrid()
    const bonusMove = this.bonusTokenMove(this.faceUpTableCardIds)

    // The bonus steals a token from the opponent: the player wins if it was their last one.
    const opponentTokensAfter = this.material(MaterialType.InstinctToken)
      .location(LocationType.PlayerTokenPile).player(this.nextPlayer).getQuantity() - (bonusMove ? 1 : 0)
    const endMove = opponentTokensAfter === 0 ? this.endGame() : this.startRule(RuleId.EndOfTurn)

    return [...refillMoves, ...(bonusMove ? [bonusMove] : []), endMove]
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    if (!isMoveItemType(MaterialType.DejaVuCard)(move)) return []
    if (move.location.rotation !== true) return []

    const newCard = this.material(MaterialType.DejaVuCard).getItem<DejaVuCardId>(move.itemIndex)
    if (!newCard?.id) return []

    if (!this.isRevealValid(move.itemIndex, newCard.id.front)) {
      return this.failureMoves()
    }

    return []
  }

  private isRevealValid(itemIndex: number, newCardId: DejaVuCard): boolean {
    const previousFaceUp = [
      ...this.material(MaterialType.DejaVuCard).location(LocationType.Grid).rotation(true).index(index => index !== itemIndex).getItems<DejaVuCardId>(),
      ...this.material(MaterialType.DejaVuCard).location(LocationType.Deck).rotation(true).index(index => index !== itemIndex).getItems<DejaVuCardId>()
    ]

    if (previousFaceUp.length === 0) return true

    const prevCommon = this.intersectNumbers(previousFaceUp.map(item => item.id.front))
    if (prevCommon.length === 0) return true

    return dejaVuCardsData[newCardId].some(n => prevCommon.includes(n))
  }

  private failureMoves(): MaterialMove[] {
    const flipMoves = [
      ...this.material(MaterialType.DejaVuCard).location(LocationType.Grid).rotation(true).rotateItems(undefined),
      ...this.material(MaterialType.DejaVuCard).location(LocationType.Deck).rotation(true).rotateItems(undefined)
    ]
    const playerTokens = this.material(MaterialType.InstinctToken)
      .location(LocationType.PlayerTokenPile).player(this.player)
    const givesToken = playerTokens.getQuantity() > 0
    const tokenMoves = givesToken
      ? [playerTokens.moveItem({ type: LocationType.PlayerTokenPile, player: this.nextPlayer }, 1)]
      : []
    // Giving away the last token hands every token to the opponent, who wins.
    const playerLosesLastToken = playerTokens.getQuantity() - (givesToken ? 1 : 0) === 0
    const endMove = playerLosesLastToken
      ? this.endGame()
      : new EndGameHelper(this.game).nextPlayerOrEnd(this.nextPlayer)
    return [...flipMoves, ...tokenMoves, endMove]
  }

  // Deal hidden deck cards (top first, excluding the End card) to refill the gaps the face-up Grid
  // cards are about to leave. The count is the number of face-up Grid cards (still present here, in
  // beforeItemMove); FillGapStrategy, applied when the deal plays (i.e. after the collect), assigns
  // each new card to the lowest free position.
  private refillGrid(): MaterialMove[] {
    const gridGaps = this.material(MaterialType.DejaVuCard).location(LocationType.Grid).rotation(true).length
    if (gridGaps === 0) return []
    // Exclude the End card by its (always-visible) back, not its hidden front: filtering on the front
    // would let the acting player's view keep the End card in the deal pool while the server drops it,
    // producing more local consequences than the server returns.
    return this.material(MaterialType.DejaVuCard)
      .location(LocationType.Deck)
      .rotation(r => !r)
      .id<DejaVuCardId>(id => id.back !== endCard)
      .deck()
      .deal({ type: LocationType.Grid }, gridGaps)
  }

  private bonusTokenMove(faceUpIds: DejaVuCard[]): MaterialMove | undefined {
    if (this.countCommonOccurrences(faceUpIds) < BONUS_TOKEN_THRESHOLD) return undefined
    const opponentTokens = this.material(MaterialType.InstinctToken)
      .location(LocationType.PlayerTokenPile).player(this.nextPlayer)
    if (opponentTokens.getQuantity() === 0) return undefined
    return opponentTokens.moveItem({ type: LocationType.PlayerTokenPile, player: this.player }, 1)
  }

  get canTerminate(): boolean {
    return this.countCommonOccurrences(this.faceUpTableCardIds) >= TERMINATE_MIN_OCCURRENCES
  }

  private get faceUpTableCardIds(): DejaVuCard[] {
    return [
      ...this.material(MaterialType.DejaVuCard).location(LocationType.Grid).rotation(true).getItems<DejaVuCardId>(),
      ...this.material(MaterialType.DejaVuCard).location(LocationType.Deck).rotation(true).getItems<DejaVuCardId>()
    ].map(item => item.id.front)
  }

  private countCommonOccurrences(cardIds: DejaVuCard[]): number {
    const common = this.intersectNumbers(cardIds)
    if (common.length === 0) return 0
    return Math.max(...common.map(n =>
      cardIds.reduce((sum, id) => sum + dejaVuCardsData[id].filter(x => x === n).length, 0)
    ))
  }

  private intersectNumbers(cardIds: DejaVuCard[]): number[] {
    if (cardIds.length === 0) return []
    let common = [...dejaVuCardsData[cardIds[0]]]
    for (const id of cardIds.slice(1)) {
      const nums = dejaVuCardsData[id]
      common = common.filter(n => nums.includes(n))
      if (common.length === 0) return []
    }
    return common
  }
}
