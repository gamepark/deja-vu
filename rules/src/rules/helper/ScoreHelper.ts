import { MaterialRulesPart } from '@gamepark/rules-api'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'

export class ScoreHelper extends MaterialRulesPart {
  getScore(player: number): number {
    const opponent = this.game.players.find((p) => p !== player)!
    if (this.getTokenCount(opponent) === 0) return 7
    const tokens = this.getTokenCount(player)
    if (tokens === 0) return 0
    const cards = this.getCardCount(player)
    return cards + tokens * 0.5
  }

  getCardCount(player: number): number {
    return this.material(MaterialType.DejaVuCard)
      .location(LocationType.PlayerPile).player(player).length
  }

  getTokenCount(player: number): number {
    return this.material(MaterialType.InstinctToken)
      .location(LocationType.PlayerTokenPile).player(player).getQuantity()
  }
}
