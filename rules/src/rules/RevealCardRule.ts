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

    moves.push(...this.material(MaterialType.DejaVuCard).location(LocationType.Grid).rotation(true).rotateItems(false))

    const topDeckCard = this.material(MaterialType.DejaVuCard).location(LocationType.Deck).maxBy(item => item.location.x ?? 0)
    if (topDeckCard.length && topDeckCard.getItem()?.location.rotation === true) {
      moves.push(topDeckCard.rotateItem(false))
    }

    if (this.canTerminate) {
      moves.push(this.customMove(CustomMoveType.Terminate))
    }

    return moves
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    if (!isMoveItemType(MaterialType.DejaVuCard)(move)) return []
    if (move.location.rotation !== false) return []

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

    const { collectMoves, faceUpIds, emptyPositions } = this.collectFaceUpCards()
    const refillMoves = this.refillGrid(emptyPositions)
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
        item.location.rotation === false
      )

    if (previousFaceUp.length === 0) return true

    const prevCommon = this.intersectNumbers(previousFaceUp.map(({ item }) => (item.id as DejaVuCardId).front))
    if (prevCommon.length === 0) return true

    return dejaVuCardsData[newCardId].some(n => prevCommon.includes(n))
  }

  private failureMoves(): MaterialMove[] {
    const flipMoves = [
      ...this.material(MaterialType.DejaVuCard).location(LocationType.Grid).rotation(false).rotateItems(true),
      ...this.material(MaterialType.DejaVuCard).location(LocationType.Deck).rotation(false).rotateItems(true)
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

  private collectFaceUpCards(): { collectMoves: MaterialMove[], faceUpIds: DejaVuCard[], emptyPositions: number[] } {
    const faceUpGridCards = this.material(MaterialType.DejaVuCard).location(LocationType.Grid).rotation(false)
    const faceUpDeckCard = this.material(MaterialType.DejaVuCard).location(LocationType.Deck).rotation(false)
    const faceUpIds: DejaVuCard[] = [
      ...faceUpGridCards.getItems().map(item => (item.id as DejaVuCardId).front),
      ...faceUpDeckCard.getItems().map(item => (item.id as DejaVuCardId).front)
    ]
    const emptyPositions = faceUpGridCards.getItems().map(item => item.location.x!)
    const collectMoves: MaterialMove[] = [
      ...faceUpGridCards.moveItems({ type: LocationType.PlayerPile, player: this.player, rotation: true }),
      ...(faceUpDeckCard.length ? [faceUpDeckCard.moveItem({ type: LocationType.PlayerPile, player: this.player, rotation: true })] : [])
    ]
    return { collectMoves, faceUpIds, emptyPositions }
  }

  private refillGrid(emptyPositions: number[]): MaterialMove[] {
    const deckIndexes = this.material(MaterialType.DejaVuCard)
      .location(LocationType.Deck)
      .sort(item => -(item.location.x ?? 0))
      .getIndexes()
      .filter(i => {
        const item = (this.game.items[MaterialType.DejaVuCard] ?? [])[i]
        return (item?.id as DejaVuCardId)?.front !== endCard && item?.location.rotation === true
      })

    return emptyPositions.slice(0, deckIndexes.length).map((x, i) =>
      this.material(MaterialType.DejaVuCard).index(deckIndexes[i]).moveItem({ type: LocationType.Grid, x, rotation: true })
    )
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
      ...this.material(MaterialType.DejaVuCard).location(LocationType.Grid).rotation(false).getItems(),
      ...this.material(MaterialType.DejaVuCard).location(LocationType.Deck).rotation(false).getItems()
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
