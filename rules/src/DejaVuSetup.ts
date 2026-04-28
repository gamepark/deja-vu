import { MaterialGameSetup } from '@gamepark/rules-api'
import { DejaVuOptions } from './DejaVuOptions'
import { DejaVuRules } from './DejaVuRules'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { PlayerColor } from './PlayerColor'
import { RuleId } from './rules/RuleId'

/**
 * This class creates a new Game based on the game options
 */
export class DejaVuSetup extends MaterialGameSetup<PlayerColor, MaterialType, LocationType, DejaVuOptions> {
  Rules = DejaVuRules

  setupMaterial(_options: DejaVuOptions) {
    // TODO
  }

  start() {
    this.startPlayerTurn(RuleId.TheFirstStep, this.players[0])
  }
}
