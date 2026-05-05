import { CompetitiveScore, isMoveItemType, MaterialGame, MaterialMove, MaterialRules, PositiveSequenceStrategy, TimeLimit } from '@gamepark/rules-api'
import { endCard } from './material/DejaVuCard'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { RuleId } from './rules/RuleId'
import { EndOfTurnRule } from './rules/EndOfTurnRule'
import { ObserveCardRule } from './rules/ObserveCardRule'
import { PlayCardRule } from './rules/PlayCardRule'
import { RevealCardRule } from './rules/RevealCardRule'

/**
 * This class implements the rules of the board game.
 * It must follow Game Park "Rules" API so that the Game Park server can enforce the rules.
 */
export class DejaVuRules
  extends MaterialRules<number, MaterialType, LocationType>
  implements
    TimeLimit<MaterialGame<number, MaterialType, LocationType>, MaterialMove<number, MaterialType, LocationType>, number>,
    CompetitiveScore<MaterialGame<number, MaterialType, LocationType>, MaterialMove<number, MaterialType, LocationType>, number>
{
  rules = {
    [RuleId.PlayCard]: PlayCardRule,
    [RuleId.ObserveCard]: ObserveCardRule,
    [RuleId.RevealCard]: RevealCardRule,
    [RuleId.EndOfTurn]: EndOfTurnRule
  }

  locationsStrategies = {
    [MaterialType.DejaVuCard]: {
      [LocationType.Deck]: new PositiveSequenceStrategy(),
    },
  }

  protected override moveBlocksUndo(move: MaterialMove<number, MaterialType, LocationType>, player?: number): boolean {
    if (isMoveItemType(MaterialType.DejaVuCard)(move) && move.location.rotation === false) return true
    return super.moveBlocksUndo(move, player)
  }

  itemsCanMerge(type: MaterialType): boolean {
    return type !== MaterialType.InstinctToken
  }

  getScore(player: number): number {
    const tokens = this.material(MaterialType.InstinctToken)
      .location(LocationType.PlayerTokenPile).player(player).length
    if (tokens >= 7) return 1000
    const cards = this.material(MaterialType.DejaVuCard)
      .location(LocationType.PlayerPile).player(player)
      .getItems().filter(item => item.id !== endCard).length
    return cards + tokens * 0.5
  }

  giveTime(): number {
    return 60
  }
}
