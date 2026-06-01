import { RuleId } from '@gamepark/deja-vu/rules/RuleId'
import { ComponentType } from 'react'
import { EndOfTurnHeader } from './EndOfTurnHeader'
import { ObserveCardHeader } from './ObserveCardHeader'
import { TakeActionHeader } from './TakeActionHeader'
import { RevealCardHeader } from './RevealCardHeader'

export const Headers: Partial<Record<RuleId, ComponentType>> = {
  [RuleId.TakeAction]: TakeActionHeader,
  [RuleId.ObserveCard]: ObserveCardHeader,
  [RuleId.RevealCard]: RevealCardHeader,
  [RuleId.EndOfTurn]: EndOfTurnHeader
}
