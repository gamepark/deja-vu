import { CustomMove, isCustomMoveType, MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { INSTINCT_WIN_THRESHOLD } from '../GameConstants'
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
      const tokens = this.material(MaterialType.InstinctToken)
        .location(LocationType.PlayerTokenPile).player(this.player).getIndexes()
      const opponentTokensBefore = this.material(MaterialType.InstinctToken)
        .location(LocationType.PlayerTokenPile).player(this.nextPlayer).length
      const tokenMove = this.material(MaterialType.InstinctToken).index(tokens[0])
        .moveItem({ type: LocationType.PlayerTokenPile, player: this.nextPlayer })
      if (opponentTokensBefore + 1 >= INSTINCT_WIN_THRESHOLD) {
        return [tokenMove, this.endGame()]
      }
      return [tokenMove, this.startRule(RuleId.PlayCard)]
    }
    return []
  }
}
