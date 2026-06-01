import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { DejaVuCardId, endCard } from '../../material/DejaVuCard'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { RuleId } from '../RuleId'

export class EndGameHelper extends MaterialRulesPart {
  nextPlayerOrEnd(nextPlayer: number): MaterialMove {
    const endCardOwner = (this.game.items[MaterialType.DejaVuCard] ?? [])
      .find(item => (item.id as DejaVuCardId)?.front === endCard && item.location.type === LocationType.PlayerPile)
      ?.location?.player
    if (endCardOwner !== undefined && nextPlayer === endCardOwner) return this.endGame()
    return this.startPlayerTurn(RuleId.TakeAction, nextPlayer)
  }
}
