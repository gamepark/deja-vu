import { MaterialGameSetup } from '@gamepark/rules-api'
import { shuffle } from 'es-toolkit'
import { DejaVuOptions } from './DejaVuOptions'
import { DejaVuRules } from './DejaVuRules'
import { cardBack, dejaVuCards, endCard } from './material/DejaVuCard'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { RuleId } from './rules/RuleId'

/**
 * This class creates a new Game based on the game options
 */
export class DejaVuSetup extends MaterialGameSetup<number, MaterialType, LocationType, DejaVuOptions> {
  Rules = DejaVuRules

  setupMaterial(_options: DejaVuOptions) {
    this.material(MaterialType.DejaVuCard).createItem({ id: { front: endCard, back: endCard }, location: { type: LocationType.Deck } })
    this.material(MaterialType.DejaVuCard).createItems(shuffle(dejaVuCards).map((card) => ({ id: { front: card, back: cardBack(card) }, location: { type: LocationType.Deck } })))

    this.material(MaterialType.DejaVuCard).deck().deal({ type: LocationType.Grid }, 8)

    this.material(MaterialType.InstinctToken).createItems([
      { quantity: 3, location: { type: LocationType.PlayerTokenPile, player: this.players[0] } },
      { quantity: 4, location: { type: LocationType.PlayerTokenPile, player: this.players[1] } }
    ])
  }

  start() {
    this.startPlayerTurn(RuleId.TakeAction, this.players[0])
  }
}
