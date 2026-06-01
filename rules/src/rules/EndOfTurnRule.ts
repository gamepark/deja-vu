import { CustomMove, isCustomMoveType, MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { CustomMoveType } from './CustomMoveType'
import { RuleId } from './RuleId'
import { EndGameHelper } from './helper/EndGameHelper'

export class EndOfTurnRule extends PlayerTurnRule {
  getPlayerMoves(): MaterialMove[] {
    return [
      this.customMove(CustomMoveType.GiveTokenToReplay),
      this.customMove(CustomMoveType.EndTurn)
    ]
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    if (isCustomMoveType(CustomMoveType.EndTurn)(move)) {
      return [new EndGameHelper(this.game).nextPlayerOrEnd(this.nextPlayer)]
    }
    if (isCustomMoveType(CustomMoveType.GiveTokenToReplay)(move)) {
      const playerTokens = this.material(MaterialType.InstinctToken)
        .location(LocationType.PlayerTokenPile).player(this.player)
      const playerCount = playerTokens.getQuantity()
      const tokenMove = playerTokens.moveItem({ type: LocationType.PlayerTokenPile, player: this.nextPlayer }, 1)
      // Giving away the last token hands every token to the opponent, who wins.
      if (playerCount === 1) {
        return [tokenMove, this.endGame()]
      }
      return [tokenMove, this.startRule(RuleId.TakeAction)]
    }
    return []
  }
}
