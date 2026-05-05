import { MoveComponentProps, usePlayerName } from '@gamepark/react-game'
import { MaterialMove } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'

export const ObserveCardLog = ({ context }: MoveComponentProps<MaterialMove>) => {
  const player = usePlayerName(context.game.rule?.player)
  return <Trans i18nKey="log.observe" values={{ player }} />
}
