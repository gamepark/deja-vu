import { isMoveItemType, ItemMove, MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { Memory } from '../Memory'
import { DejaVuCardId, endCard } from '../material/DejaVuCard'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { RuleId } from './RuleId'
import { EndGameHelper } from './helper/EndGameHelper'

export class TakeActionRule extends PlayerTurnRule {
  onRuleStart(): MaterialMove[] {
    const gridCards = this.material(MaterialType.DejaVuCard).location(LocationType.Grid)
    const deckCards = this.material(MaterialType.DejaVuCard).location(LocationType.Deck)
    if (gridCards.length === 0 && deckCards.length === 0) {
      return [new EndGameHelper(this.game).nextPlayerOrEnd(this.nextPlayer)]
    }
    return []
  }

  getPlayerMoves(): MaterialMove[] {
    const moves: MaterialMove[] = []
    const gridCards = this.material(MaterialType.DejaVuCard).location(LocationType.Grid)
    const topDeckCard = this.material(MaterialType.DejaVuCard)
      .location(LocationType.Deck)
      .maxBy(item => item.location.x ?? 0)
    const topDeckFront = topDeckCard.getItem<DejaVuCardId>()?.id.front

    // Drag-drop de la carte Fin vers la pile si elle est au sommet du deck.
    // Prendre la carte Fin doit être l'unique action du tour : interdit après avoir donné un jeton pour rejouer.
    if (topDeckCard.length && topDeckFront === endCard && !this.remind(Memory.TokenGivenThisTurn)) {
      moves.push(topDeckCard.moveItem({ type: LocationType.PlayerPile, player: this.player }))
    }

    // Observer: stocker la position d'origine dans location.id pour pouvoir remettre la carte en place
    moves.push(...gridCards.moveItems(item => ({
      type: LocationType.PlayerShowCard,
      player: this.player,
      rotation: true,
      id: item.location.x
    })))
    if (topDeckCard.length && topDeckFront !== endCard) {
      moves.push(topDeckCard.moveItem({ type: LocationType.PlayerShowCard, player: this.player, rotation: true }))
    }

    // Retourner: révéler la carte sur place (rotation true)
    moves.push(...gridCards.rotateItems(true))
    if (topDeckCard.length && topDeckFront !== endCard) {
      moves.push(topDeckCard.rotateItem(true))
    }

    return moves
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    if (!isMoveItemType(MaterialType.DejaVuCard)(move)) return []
    for (const item of this.game.items[MaterialType.DejaVuCard] ?? []) {
      if (item.selected) delete item.selected
    }
    if (move.location.type === LocationType.PlayerPile) {
      return [this.startPlayerTurn(RuleId.TakeAction, this.nextPlayer)]
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
