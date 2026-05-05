import { MaterialRulesPart } from '@gamepark/rules-api'
import { INSTINCT_WIN_THRESHOLD } from '../../GameConstants'
import { endCard } from '../../material/DejaVuCard'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { PlayerColor } from '../../PlayerColor'

export class ScoreHelper extends MaterialRulesPart {
  getScore(player: PlayerColor): number {
    const tokens = this.material(MaterialType.InstinctToken)
      .location(LocationType.PlayerTokenPile).player(player).length
    if (tokens >= INSTINCT_WIN_THRESHOLD) return 1000
    const cards = this.material(MaterialType.DejaVuCard)
      .location(LocationType.PlayerPile).player(player)
      .getItems().filter(item => item.id !== endCard).length
    return cards + tokens * 0.5
  }

  getTokenCount(player: PlayerColor): number {
    return this.material(MaterialType.InstinctToken)
      .location(LocationType.PlayerTokenPile).player(player).length
  }
}
