import { CustomMove, isCustomMoveType, MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { endCard } from '../material/DejaVuCard'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { CustomMoveType } from './CustomMoveType'
import { RuleId } from './RuleId'

export class EndOfTurnRule extends PlayerTurnRule {
  getPlayerMoves(): MaterialMove[] {
    return [
      this.customMove(CustomMoveType.GiveTokenToReplay),
      this.customMove(CustomMoveType.EndTurn)
    ]
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    if (isCustomMoveType(CustomMoveType.EndTurn)(move)) {
      return [this.nextPlayerOrEnd()]
    }
    if (isCustomMoveType(CustomMoveType.GiveTokenToReplay)(move)) {
      const tokens = this.material(MaterialType.InstinctToken)
        .location(LocationType.PlayerTokenPile).player(this.player).getIndexes()
      const opponentTokensBefore = this.material(MaterialType.InstinctToken)
        .location(LocationType.PlayerTokenPile).player(this.nextPlayer).length
      const tokenMove = this.material(MaterialType.InstinctToken).index(tokens[0])
        .moveItem({ type: LocationType.PlayerTokenPile, player: this.nextPlayer })
      if (opponentTokensBefore + 1 >= 7) {
        return [tokenMove, this.endGame()]
      }
      return [tokenMove, this.startRule(RuleId.PlayCard)]
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
