import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { DejaVuCardId, endCard } from '../../material/DejaVuCard'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { RuleId } from '../RuleId'

export class EndGameHelper extends MaterialRulesPart {
  nextPlayerOrEnd(nextPlayer: number): MaterialMove {
    const endCardOwner = this.material(MaterialType.DejaVuCard)
      .location(LocationType.PlayerPile)
      .getItem<DejaVuCardId>(item => item.id.front === endCard)
      ?.location.player
    if (endCardOwner !== undefined && nextPlayer === endCardOwner) return this.endGame()
    return this.startPlayerTurn(RuleId.TakeAction, nextPlayer)
  }
}
