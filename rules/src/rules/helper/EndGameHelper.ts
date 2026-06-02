import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { Memory } from '../../Memory'
import { DejaVuCardId, endCard } from '../../material/DejaVuCard'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { RuleId } from '../RuleId'

export class EndGameHelper extends MaterialRulesPart {
  nextPlayerOrEnd(nextPlayer: number): MaterialMove {
    // The turn passes to the next player: a fresh turn may take the End card as its single action again.
    this.forget(Memory.TokenGivenThisTurn)
    const endCardOwner = this.material(MaterialType.DejaVuCard)
      .location(LocationType.PlayerPile)
      .getItem<DejaVuCardId>(item => item.id.front === endCard)
      ?.location.player
    if (endCardOwner !== undefined && nextPlayer === endCardOwner) return this.endGame()
    return this.startPlayerTurn(RuleId.TakeAction, nextPlayer)
  }
}
