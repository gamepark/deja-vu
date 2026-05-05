import { MoveComponentProps, usePlayerName } from '@gamepark/react-game'
import { MaterialMove } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'

export const TakeEndCardLog = ({ context }: MoveComponentProps<MaterialMove>) => {
  const player = usePlayerName(context.game.rule?.player)
  return <Trans i18nKey="log.take-end-card" values={{ player }} />
}
