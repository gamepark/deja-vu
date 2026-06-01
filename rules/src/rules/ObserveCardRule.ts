import { isMoveItemType, ItemMove, MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { RuleId } from './RuleId'
import { EndGameHelper } from './helper/EndGameHelper'

export class ObserveCardRule extends PlayerTurnRule {
  getPlayerMoves(): MaterialMove[] {
    const showCard = this.material(MaterialType.DejaVuCard)
      .location(LocationType.PlayerShowCard)
      .player(this.player)

    if (!showCard.length) return []

    const item = showCard.getItem()!
    if (item.location.id !== undefined) {
      return [showCard.moveItem({ type: LocationType.Grid, x: item.location.id })]
    }
    return [showCard.moveItem({ type: LocationType.Deck })]
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    if (!isMoveItemType(MaterialType.DejaVuCard)(move)) return []
    if (move.location.type === LocationType.Grid || move.location.type === LocationType.Deck) {
      const hasTokens = this.material(MaterialType.InstinctToken)
        .location(LocationType.PlayerTokenPile).player(this.player).getQuantity() > 0
      return [hasTokens ? this.startRule(RuleId.EndOfTurn) : new EndGameHelper(this.game).nextPlayerOrEnd(this.nextPlayer)]
    }
    return []
  }
}
