import { isMoveItemType, ItemMove, MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { endCard } from '../material/DejaVuCard'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { RuleId } from './RuleId'

export class ObserveCardRule extends PlayerTurnRule {
  getPlayerMoves(): MaterialMove[] {
    const showCard = this.material(MaterialType.DejaVuCard)
      .location(LocationType.PlayerShowCard)
      .player(this.player)

    if (!showCard.length) return []

    const item = showCard.getItem()!
    // location.id contient la position x d'origine sur la grid (undefined si venait du deck)
    if (item.location.id !== undefined) {
      return [showCard.moveItem({ type: LocationType.Grid, x: item.location.id, rotation: true })]
    }
    return [showCard.moveItem({ type: LocationType.Deck, rotation: true })]
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    if (!isMoveItemType(MaterialType.DejaVuCard)(move)) return []
    if (move.location.type === LocationType.Grid || move.location.type === LocationType.Deck) {
      const hasTokens = this.material(MaterialType.InstinctToken)
        .location(LocationType.PlayerTokenPile).player(this.player).length > 0
      return [hasTokens ? this.startRule(RuleId.EndOfTurn) : this.nextPlayerOrEnd()]
    }
    return []
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
