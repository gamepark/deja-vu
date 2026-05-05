import { MaterialGameSetup } from '@gamepark/rules-api'
import { shuffle } from 'es-toolkit'
import { DejaVuOptions } from './DejaVuOptions'
import { DejaVuRules } from './DejaVuRules'
import { dejaVuCards, endCard } from './material/DejaVuCard'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { RuleId } from './rules/RuleId'

/**
 * This class creates a new Game based on the game options
 */
export class DejaVuSetup extends MaterialGameSetup<number, MaterialType, LocationType, DejaVuOptions> {
  Rules = DejaVuRules

  setupMaterial(_options: DejaVuOptions) {
    this.material(MaterialType.DejaVuCard).createItem({ id: endCard, location: { type: LocationType.Deck } })
    this.material(MaterialType.DejaVuCard).createItems(shuffle(dejaVuCards).map((id) => ({ id, location: { type: LocationType.Deck, rotation: true } })))

    for (let i = 0; i < 8; i++) {
      this.material(MaterialType.DejaVuCard)
        .location(LocationType.Deck)
        .maxBy((item) => item.location.x ?? 0)
        .moveItems({ type: LocationType.Grid, x: i, rotation: true })
    }

    this.material(MaterialType.InstinctToken).createItems([
      ...Array.from({ length: 3 }, () => ({ location: { type: LocationType.PlayerTokenPile, player: this.players[0] } })),
      ...Array.from({ length: 4 }, () => ({ location: { type: LocationType.PlayerTokenPile, player: this.players[1] } }))
    ])
  }

  start() {
    this.startPlayerTurn(RuleId.PlayCard, this.players[0])
  }
}
