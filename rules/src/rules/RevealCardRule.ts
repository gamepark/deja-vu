import { CustomMove, isCustomMoveType, isMoveItemType, ItemMove, MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { dejaVuCardsData, DejaVuCard, DejaVuCardId, endCard } from '../material/DejaVuCard'
import { BONUS_TOKEN_THRESHOLD, TERMINATE_MIN_OCCURRENCES } from '../GameConstants'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { CustomMoveType } from './CustomMoveType'
import { RuleId } from './RuleId'
import { EndGameHelper } from './helper/EndGameHelper'

export class RevealCardRule extends PlayerTurnRule {
  getPlayerMoves(): MaterialMove[] {
    const moves: MaterialMove[] = []

    moves.push(...this.material(MaterialType.DejaVuCard).location(LocationType.Grid).rotation(r => !r).rotateItems(true))

    const topDeckCard = this.material(MaterialType.DejaVuCard).location(LocationType.Deck).maxBy(item => item.location.x ?? 0)
    const topDeckItem = topDeckCard.getItem<DejaVuCardId>()
    if (topDeckCard.length && !topDeckItem?.location.rotation && topDeckItem?.id.front !== endCard) {
      moves.push(topDeckCard.rotateItem(true))
    }

    if (this.canTerminate) {
      moves.push(this.customMove(CustomMoveType.Terminate))
    }

    return moves
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

  onCustomMove(move: CustomMove): MaterialMove[] {
    if (!isCustomMoveType(CustomMoveType.Terminate)(move)) return []

    const { collectMoves, faceUpIds, gridCount } = this.collectFaceUpCards()
    const refillMoves = this.refillGrid(gridCount)
    const bonusMove = this.bonusTokenMove(faceUpIds)

    // The bonus steals a token from the opponent: the player wins if it was their last one.
    const opponentTokensAfter = this.material(MaterialType.InstinctToken)
      .location(LocationType.PlayerTokenPile).player(this.nextPlayer).getQuantity() - (bonusMove ? 1 : 0)
    const endMove = opponentTokensAfter === 0 ? this.endGame() : this.startRule(RuleId.EndOfTurn)

    return [
      ...collectMoves,
      ...refillMoves,
      ...(bonusMove ? [bonusMove] : []),
      endMove
    ]
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

  private collectFaceUpCards(): { collectMoves: MaterialMove[], faceUpIds: DejaVuCard[], gridCount: number } {
    const faceUpGridCards = this.material(MaterialType.DejaVuCard).location(LocationType.Grid).rotation(true)
    const faceUpDeckCard = this.material(MaterialType.DejaVuCard).location(LocationType.Deck).rotation(true)
    const faceUpIds: DejaVuCard[] = [
      ...faceUpGridCards.getItems<DejaVuCardId>().map(item => item.id.front),
      ...faceUpDeckCard.getItems<DejaVuCardId>().map(item => item.id.front)
    ]
    const collectMoves: MaterialMove[] = [
      ...faceUpGridCards.moveItems({ type: LocationType.PlayerPile, player: this.player }),
      ...(faceUpDeckCard.length ? [faceUpDeckCard.moveItem({ type: LocationType.PlayerPile, player: this.player })] : [])
    ]
    return { collectMoves, faceUpIds, gridCount: faceUpGridCards.length }
  }

  // Deal hidden deck cards (top first, excluding the End card) onto the Grid;
  // FillGapStrategy assigns each one to the lowest free position.
  private refillGrid(count: number): MaterialMove[] {
    return this.material(MaterialType.DejaVuCard)
      .location(LocationType.Deck)
      .rotation(r => !r)
      .id<DejaVuCardId>(id => id.front !== endCard)
      .deck()
      .deal({ type: LocationType.Grid }, count)
  }

  private bonusTokenMove(faceUpIds: DejaVuCard[]): MaterialMove | undefined {
    if (this.countCommonOccurrences(faceUpIds) < BONUS_TOKEN_THRESHOLD) return undefined
    const opponentTokens = this.material(MaterialType.InstinctToken)
      .location(LocationType.PlayerTokenPile).player(this.nextPlayer)
    if (opponentTokens.getQuantity() === 0) return undefined
    return opponentTokens.moveItem({ type: LocationType.PlayerTokenPile, player: this.player }, 1)
  }

  private get canTerminate(): boolean {
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
