import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { endCard } from '../../material/DejaVuCard'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { PlayerColor } from '../../PlayerColor'
import { RuleId } from '../RuleId'

export class EndGameHelper extends MaterialRulesPart {
  nextPlayerOrEnd(nextPlayer: PlayerColor): MaterialMove {
    const endCardOwner = (this.game.items[MaterialType.DejaVuCard] ?? [])
      .find(item => item.id === endCard && item.location.type === LocationType.PlayerPile)
      ?.location?.player
    if (endCardOwner !== undefined && nextPlayer === endCardOwner) return this.endGame()
    return this.startPlayerTurn(RuleId.PlayCard, nextPlayer)
  }
}
