import { MaterialRulesPart } from '@gamepark/rules-api'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'

export class ScoreHelper extends MaterialRulesPart {
  getScore(player: number): number {
    if (this.hasAllTokens(player)) return 1000
    const tokens = this.getTokenCount(player)
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

  /** A player wins instantly when they hold every instinct token, i.e. no opponent has any. */
  hasAllTokens(player: number): boolean {
    return this.material(MaterialType.InstinctToken)
      .location(LocationType.PlayerTokenPile)
      .player(p => p !== player)
      .getQuantity() === 0
  }
}
