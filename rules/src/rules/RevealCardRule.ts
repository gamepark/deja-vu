import { CustomMove, isCustomMoveType, isMoveItemType, ItemMove, MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { dejaVuCardsData, DejaVuCard, endCard } from '../material/DejaVuCard'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { CustomMoveType } from './CustomMoveType'
import { RuleId } from './RuleId'

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

    const previousFaceUp = allItems
      .map((item, index) => ({ item, index }))
      .filter(({ item, index }) =>
        index !== move.itemIndex &&
        (item.location.type === LocationType.Grid || item.location.type === LocationType.Deck) &&
        item.location.rotation === false
      )

    if (previousFaceUp.length === 0) return []

    const prevCommon = this.intersectNumbers(previousFaceUp.map(({ item }) => item.id as DejaVuCard))
    if (prevCommon.length === 0) return []

    const newNumbers = dejaVuCardsData[newCard.id as DejaVuCard]
    const isValid = newNumbers.some(n => prevCommon.includes(n))

    if (!isValid) {
      const flipMoves = [
        ...this.material(MaterialType.DejaVuCard).location(LocationType.Grid).rotation(false).rotateItems(true),
        ...this.material(MaterialType.DejaVuCard).location(LocationType.Deck).rotation(false).rotateItems(true)
      ]
      const tokensBefore = this.material(MaterialType.InstinctToken)
        .location(LocationType.PlayerTokenPile).player(this.player).length
      const opponentTokensBefore = this.material(MaterialType.InstinctToken)
        .location(LocationType.PlayerTokenPile).player(this.nextPlayer).length
      const tokenToGive = this.material(MaterialType.InstinctToken)
        .location(LocationType.PlayerTokenPile).player(this.player).getIndexes()
      const tokenMoves = tokenToGive.length > 0
        ? [this.material(MaterialType.InstinctToken).index(tokenToGive[0]).moveItem({ type: LocationType.PlayerTokenPile, player: this.nextPlayer })]
        : []
      const opponentTokensAfter = opponentTokensBefore + (tokenMoves.length > 0 ? 1 : 0)
      let endMove: MaterialMove
      if (opponentTokensAfter >= 7) {
        endMove = this.endGame()
      } else {
        const tokensAfter = tokensBefore - (tokenMoves.length > 0 ? 1 : 0)
        endMove = tokensAfter > 0 ? this.startRule(RuleId.EndOfTurn) : this.nextPlayerOrEnd()
      }
      return [...flipMoves, ...tokenMoves, endMove]
    }

    return []
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    if (!isCustomMoveType(CustomMoveType.Terminate)(move)) return []

    const moves: MaterialMove[] = []

    const faceUpGridCards = this.material(MaterialType.DejaVuCard).location(LocationType.Grid).rotation(false)
    const faceUpDeckCard = this.material(MaterialType.DejaVuCard).location(LocationType.Deck).rotation(false)
    const faceUpIds = [
      ...faceUpGridCards.getItems().map(item => item.id as DejaVuCard),
      ...faceUpDeckCard.getItems().map(item => item.id as DejaVuCard)
    ]
    const emptyPositions = faceUpGridCards.getItems().map(item => item.location.x!)
    moves.push(...faceUpGridCards.moveItems({ type: LocationType.PlayerPile, player: this.player, rotation: true }))
    if (faceUpDeckCard.length) {
      moves.push(faceUpDeckCard.moveItem({ type: LocationType.PlayerPile, player: this.player, rotation: true }))
    }

    // Reremplissage sans la carte Fin ni la carte deck déjà face visible
    const deckIndexes = this.material(MaterialType.DejaVuCard)
      .location(LocationType.Deck)
      .sort(item => -(item.location.x ?? 0))
      .getIndexes()
      .filter(i => {
        const item = (this.game.items[MaterialType.DejaVuCard] ?? [])[i]
        return item?.id !== endCard && item?.location.rotation === true
      })

    for (let i = 0; i < emptyPositions.length && i < deckIndexes.length; i++) {
      moves.push(
        this.material(MaterialType.DejaVuCard).index(deckIndexes[i]).moveItem({
          type: LocationType.Grid,
          x: emptyPositions[i],
          rotation: true
        })
      )
    }

    const tokensBefore = this.material(MaterialType.InstinctToken)
      .location(LocationType.PlayerTokenPile).player(this.player).length
    let willGain = false
    if (this.countCommonOccurrences(faceUpIds) >= 4) {
      const opponentTokens = this.material(MaterialType.InstinctToken)
        .location(LocationType.PlayerTokenPile).player(this.nextPlayer).getIndexes()
      if (opponentTokens.length > 0) {
        moves.push(this.material(MaterialType.InstinctToken).index(opponentTokens[0]).moveItem({ type: LocationType.PlayerTokenPile, player: this.player }))
        willGain = true
      }
    }

    const tokensAfter = tokensBefore + (willGain ? 1 : 0)
    let endMove: MaterialMove
    if (tokensAfter >= 7) {
      endMove = this.endGame()
    } else {
      endMove = tokensAfter > 0 ? this.startRule(RuleId.EndOfTurn) : this.nextPlayerOrEnd()
    }
    moves.push(endMove)
    return moves
  }

  private get canTerminate(): boolean {
    const faceUpIds = (this.game.items[MaterialType.DejaVuCard] ?? [])
      .filter(item =>
        (item.location.type === LocationType.Grid || item.location.type === LocationType.Deck) &&
        item.location.rotation === false
      )
      .map(item => item.id as DejaVuCard)

    return this.countCommonOccurrences(faceUpIds) >= 3
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

  private nextPlayerOrEnd(): MaterialMove {
    const endCardOwner = (this.game.items[MaterialType.DejaVuCard] ?? [])
      .find(item => item.id === endCard && item.location.type === LocationType.PlayerPile)
      ?.location?.player
    if (endCardOwner !== undefined && this.nextPlayer === endCardOwner) {
      return this.endGame()
    }
    return this.startPlayerTurn(RuleId.PlayCard, this.nextPlayer)
  }
}
