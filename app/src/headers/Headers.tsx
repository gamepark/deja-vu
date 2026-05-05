import { RuleId } from '@gamepark/deja-vu/rules/RuleId'
import { ComponentType } from 'react'
import { EndOfTurnHeader } from './EndOfTurnHeader'
import { ObserveCardHeader } from './ObserveCardHeader'
import { PlayCardHeader } from './PlayCardHeader'
import { RevealCardHeader } from './RevealCardHeader'

export const Headers: Partial<Record<RuleId, ComponentType>> = {
  [RuleId.PlayCard]: PlayCardHeader,
  [RuleId.ObserveCard]: ObserveCardHeader,
  [RuleId.RevealCard]: RevealCardHeader,
  [RuleId.EndOfTurn]: EndOfTurnHeader
}
