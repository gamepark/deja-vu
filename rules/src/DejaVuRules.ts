import { MaterialGame, MaterialMove, MaterialRules, PositiveSequenceStrategy, TimeLimit } from '@gamepark/rules-api'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { RuleId } from './rules/RuleId'
import { TheFirstStepRule } from './rules/TheFirstStepRule'

/**
 * This class implements the rules of the board game.
 * It must follow Game Park "Rules" API so that the Game Park server can enforce the rules.
 */
export class DejaVuRules
  extends MaterialRules<number, MaterialType, LocationType>
  implements TimeLimit<MaterialGame<number, MaterialType, LocationType>, MaterialMove<number, MaterialType, LocationType>, number>
{
  rules = {
    [RuleId.TheFirstStep]: TheFirstStepRule
  }

  locationsStrategies = {
    [MaterialType.DejaVuCard]: {
      [LocationType.Deck]: new PositiveSequenceStrategy(),
    },
  }

  giveTime(): number {
    return 60
  }
}
