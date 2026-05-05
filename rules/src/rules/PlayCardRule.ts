import { isMoveItemType, ItemMove, MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { endCard } from '../material/DejaVuCard'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { RuleId } from './RuleId'

export class PlayCardRule extends PlayerTurnRule {
  getPlayerMoves(): MaterialMove[] {
    const moves: MaterialMove[] = []
    const gridCards = this.material(MaterialType.DejaVuCard).location(LocationType.Grid)
    const topDeckCard = this.material(MaterialType.DejaVuCard)
      .location(LocationType.Deck)
      .maxBy(item => item.location.x ?? 0)

    // Drag-drop de la carte Fin vers la pile si elle est au sommet du deck
    if (topDeckCard.length && topDeckCard.getItem()?.id === endCard) {
      moves.push(topDeckCard.moveItem({ type: LocationType.PlayerPile, player: this.player }))
    }

    // Observer: stocker la position d'origine dans location.id pour pouvoir remettre la carte en place
    moves.push(...gridCards.moveItems(item => ({
      type: LocationType.PlayerShowCard,
      player: this.player,
      rotation: false,
      id: item.location.x
    })))
    if (topDeckCard.length) {
      moves.push(topDeckCard.moveItem({ type: LocationType.PlayerShowCard, player: this.player, rotation: false }))
    }

    // Retourner: retourner la carte sur place (rotation false)
    moves.push(...gridCards.rotateItems(false))
    if (topDeckCard.length) {
      moves.push(topDeckCard.rotateItem(false))
    }

    return moves
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    if (!isMoveItemType(MaterialType.DejaVuCard)(move)) return []
    for (const item of this.game.items[MaterialType.DejaVuCard] ?? []) {
      if (item.selected) delete item.selected
    }
    if (move.location.type === LocationType.PlayerPile) {
      return [this.startPlayerTurn(RuleId.PlayCard, this.nextPlayer)]
    }
    if (move.location.type === LocationType.PlayerShowCard) {
      return [this.startRule(RuleId.ObserveCard)]
    }
    if (move.location.type === LocationType.Grid || move.location.type === LocationType.Deck) {
      return [this.startRule(RuleId.RevealCard)]
    }
    return []
  }
}
