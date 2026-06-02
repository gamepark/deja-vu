import { LogDescription, MoveComponentContext, MovePlayedLogDescription } from '@gamepark/react-game'
import { isCustomMoveType, isMoveItemType, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { LocationType } from '@gamepark/deja-vu/material/LocationType'
import { MaterialType } from '@gamepark/deja-vu/material/MaterialType'
import { CustomMoveType } from '@gamepark/deja-vu/rules/CustomMoveType'
import { RuleId } from '@gamepark/deja-vu/rules/RuleId'
import { FlipCardLog } from './FlipCardLog'
import { GiveTokenLog } from './GiveTokenLog'
import { ObserveCardLog } from './ObserveCardLog'
import { RevealCardLog } from './RevealCardLog'
import { TakeEndCardLog } from './TakeEndCardLog'
import { TerminateLog } from './TerminateLog'
import { TokenTransferLog } from './TokenTransferLog'

export class DejaVuLogs implements LogDescription<MaterialMove, number, MaterialGame> {
  getMovePlayedLogDescription(
    move: MaterialMove,
    context: MoveComponentContext<MaterialMove, number, MaterialGame>
  ): MovePlayedLogDescription | undefined {
    const ruleId = context.game.rule?.id
    const player = context.game.rule?.player

    if (ruleId === RuleId.TakeAction && isMoveItemType(MaterialType.DejaVuCard)(move)) {
      if (move.location.type === LocationType.PlayerShowCard) {
        return { player, Component: ObserveCardLog }
      }
      if (move.location.type === LocationType.PlayerPile) {
        return { player, Component: TakeEndCardLog }
      }
      if (move.location.rotation === true) {
        return { player, Component: FlipCardLog }
      }
    }

    if (ruleId === RuleId.RevealCard) {
      if (isMoveItemType(MaterialType.DejaVuCard)(move) && move.location.rotation === true) {
        return { player, Component: RevealCardLog }
      }
      if (isCustomMoveType(CustomMoveType.Terminate)(move)) {
        return { player, Component: TerminateLog }
      }
      if (isMoveItemType(MaterialType.InstinctToken)(move)) {
        return { Component: TokenTransferLog, depth: 1 }
      }
    }

    if (ruleId === RuleId.EndOfTurn && isMoveItemType(MaterialType.InstinctToken)(move)) {
      return { player, Component: GiveTokenLog }
    }

    return undefined
  }
}
