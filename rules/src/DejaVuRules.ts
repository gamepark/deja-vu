import { CompetitiveScore, FillGapStrategy, hideFrontToOthers, isMoveItemType, MaterialGame, MaterialItem, MaterialMove, PositiveSequenceStrategy, SecretMaterialRules, TimeLimit } from '@gamepark/rules-api'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { ScoreHelper } from './rules/helper/ScoreHelper'
import { RuleId } from './rules/RuleId'
import { EndOfTurnRule } from './rules/EndOfTurnRule'
import { ObserveCardRule } from './rules/ObserveCardRule'
import { TakeActionRule } from './rules/TakeActionRule'
import { RevealCardRule } from './rules/RevealCardRule'

const hideFlippedCardFront = (item: MaterialItem) =>
  !item.location.rotation ? ['id.front'] : []

/**
 * This class implements the rules of the board game.
 * It must follow Game Park "Rules" API so that the Game Park server can enforce the rules.
 */
export class DejaVuRules
  extends SecretMaterialRules<number, MaterialType, LocationType>
  implements
    TimeLimit<MaterialGame<number, MaterialType, LocationType>, MaterialMove<number, MaterialType, LocationType>, number>,
    CompetitiveScore<MaterialGame<number, MaterialType, LocationType>, MaterialMove<number, MaterialType, LocationType>, number>
{
  hidingStrategies = {
    [MaterialType.DejaVuCard]: {
      [LocationType.Deck]: hideFlippedCardFront,
      [LocationType.Grid]: hideFlippedCardFront,
      [LocationType.PlayerShowCard]: hideFrontToOthers,
    }
  }

  rules = {
    [RuleId.TakeAction]: TakeActionRule,
    [RuleId.ObserveCard]: ObserveCardRule,
    [RuleId.RevealCard]: RevealCardRule,
    [RuleId.EndOfTurn]: EndOfTurnRule
  }

  locationsStrategies = {
    [MaterialType.DejaVuCard]: {
      [LocationType.Deck]: new PositiveSequenceStrategy(),
      [LocationType.Grid]: new FillGapStrategy(),
    },
  }

  protected override moveBlocksUndo(move: MaterialMove<number, MaterialType, LocationType>, player?: number): boolean {
    if (isMoveItemType(MaterialType.DejaVuCard)(move) && move.location.rotation === true) return true
    return super.moveBlocksUndo(move, player)
  }

  scoreHelper = new ScoreHelper(this.game)

  getScore(player: number): number {
    return this.scoreHelper.getScore(player)
  }

  giveTime(): number {
    return 60
  }
}
