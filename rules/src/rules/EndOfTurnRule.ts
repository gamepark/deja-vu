import { CustomMove, isCustomMoveType, isMoveItemType, ItemMove, MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { CustomMoveType } from './CustomMoveType'
import { RuleId } from './RuleId'
import { EndGameHelper } from './helper/EndGameHelper'

export class EndOfTurnRule extends PlayerTurnRule {
  getPlayerMoves(): MaterialMove[] {
    return [
      // Give a token to the opponent to replay
      this.material(MaterialType.InstinctToken)
        .location(LocationType.PlayerTokenPile).player(this.player)
        .moveItem({ type: LocationType.PlayerTokenPile, player: this.nextPlayer }, 1),
      this.customMove(CustomMoveType.EndTurn)
    ]
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    if (!isMoveItemType(MaterialType.InstinctToken)(move)) return []
    // Giving away the last token hands every token to the opponent, who wins.
    const remaining = this.material(MaterialType.InstinctToken)
      .location(LocationType.PlayerTokenPile).player(this.player).getQuantity()
    return remaining === 0 ? [this.endGame()] : [this.startRule(RuleId.TakeAction)]
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    if (isCustomMoveType(CustomMoveType.EndTurn)(move)) {
      return [new EndGameHelper(this.game).nextPlayerOrEnd(this.nextPlayer)]
    }
    return []
  }
}
