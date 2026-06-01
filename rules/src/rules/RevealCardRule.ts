import { CustomMove, isCustomMoveType, isMoveItemType, ItemMove, MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { dejaVuCardsData, DejaVuCard, DejaVuCardId, endCard } from '../material/DejaVuCard'
import { BONUS_TOKEN_THRESHOLD, INSTINCT_WIN_THRESHOLD, TERMINATE_MIN_OCCURRENCES } from '../GameConstants'
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
    const topDeckItem = topDeckCard.getItem()
    if (topDeckCard.length && !topDeckItem?.location.rotation && (topDeckItem?.id as DejaVuCardId)?.front !== endCard) {
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

    const allItems = this.game.items[MaterialType.DejaVuCard] ?? []
    const newCard = allItems[move.itemIndex]
    if (!newCard?.id) return []

    if (!this.isRevealValid(move.itemIndex, (newCard.id as DejaVuCardId).front, allItems)) {
      return this.failureMoves()
    }

    return []
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    if (!isCustomMoveType(CustomMoveType.Terminate)(move)) return []

    const { collectMoves, faceUpIds, gridCount } = this.collectFaceUpCards()
    const refillMoves = this.refillGrid(gridCount)
    const bonusMove = this.bonusTokenMove(faceUpIds)

    const tokensBefore = this.material(MaterialType.InstinctToken)
      .location(LocationType.PlayerTokenPile).player(this.player).length
    const tokensAfter = tokensBefore + (bonusMove ? 1 : 0)

    return [
      ...collectMoves,
      ...refillMoves,
      ...(bonusMove ? [bonusMove] : []),
      this.endMoveAfterTokenChange(tokensAfter)
    ]
  }

  private isRevealValid(itemIndex: number, newCardId: DejaVuCard, allItems: { id?: unknown, location: { type: LocationType, rotation?: boolean } }[]): boolean {
    const previousFaceUp = allItems
      .map((item, index) => ({ item, index }))
      .filter(({ item, index }) =>
        index !== itemIndex &&
        (item.location.type === LocationType.Grid || item.location.type === LocationType.Deck) &&
        item.location.rotation === true
      )

    if (previousFaceUp.length === 0) return true

    const prevCommon = this.intersectNumbers(previousFaceUp.map(({ item }) => (item.id as DejaVuCardId).front))
    if (prevCommon.length === 0) return true

    return dejaVuCardsData[newCardId].some(n => prevCommon.includes(n))
  }

  private failureMoves(): MaterialMove[] {
    const flipMoves = [
      ...this.material(MaterialType.DejaVuCard).location(LocationType.Grid).rotation(true).rotateItems(undefined),
      ...this.material(MaterialType.DejaVuCard).location(LocationType.Deck).rotation(true).rotateItems(undefined)
    ]
    const opponentTokensBefore = this.material(MaterialType.InstinctToken)
      .location(LocationType.PlayerTokenPile).player(this.nextPlayer).length
    const tokenToGive = this.material(MaterialType.InstinctToken)
      .location(LocationType.PlayerTokenPile).player(this.player).getIndexes()
    const tokenMoves = tokenToGive.length > 0
      ? [this.material(MaterialType.InstinctToken).index(tokenToGive[0]).moveItem({ type: LocationType.PlayerTokenPile, player: this.nextPlayer })]
      : []
    const opponentTokensAfter = opponentTokensBefore + (tokenMoves.length > 0 ? 1 : 0)
    const endMove = opponentTokensAfter >= INSTINCT_WIN_THRESHOLD
      ? this.endGame()
      : new EndGameHelper(this.game).nextPlayerOrEnd(this.nextPlayer)
    return [...flipMoves, ...tokenMoves, endMove]
  }

  private collectFaceUpCards(): { collectMoves: MaterialMove[], faceUpIds: DejaVuCard[], gridCount: number } {
    const faceUpGridCards = this.material(MaterialType.DejaVuCard).location(LocationType.Grid).rotation(true)
    const faceUpDeckCard = this.material(MaterialType.DejaVuCard).location(LocationType.Deck).rotation(true)
    const faceUpIds: DejaVuCard[] = [
      ...faceUpGridCards.getItems().map(item => (item.id as DejaVuCardId).front),
      ...faceUpDeckCard.getItems().map(item => (item.id as DejaVuCardId).front)
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
      .location(LocationType.PlayerTokenPile).player(this.nextPlayer).getIndexes()
    if (opponentTokens.length === 0) return undefined
    return this.material(MaterialType.InstinctToken).index(opponentTokens[0])
      .moveItem({ type: LocationType.PlayerTokenPile, player: this.player })
  }

  private endMoveAfterTokenChange(tokensAfter: number): MaterialMove {
    if (tokensAfter >= INSTINCT_WIN_THRESHOLD) return this.endGame()
    return tokensAfter > 0 ? this.startRule(RuleId.EndOfTurn) : new EndGameHelper(this.game).nextPlayerOrEnd(this.nextPlayer)
  }

  private get canTerminate(): boolean {
    return this.countCommonOccurrences(this.faceUpTableCardIds) >= TERMINATE_MIN_OCCURRENCES
  }

  private get faceUpTableCardIds(): DejaVuCard[] {
    return [
      ...this.material(MaterialType.DejaVuCard).location(LocationType.Grid).rotation(true).getItems(),
      ...this.material(MaterialType.DejaVuCard).location(LocationType.Deck).rotation(true).getItems()
    ].map(item => (item.id as DejaVuCardId).front)
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
