import { MaterialLogProps, usePlayerName } from '@gamepark/react-game'
import { MoveItem } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'

export const TokenTransferLog = ({ move, context }: MaterialLogProps<MoveItem>) => {
  const activePlayer = context.game.rule?.player
  const isBonus = move.location.player === activePlayer

  const giver = usePlayerName(isBonus ? context.game.players.find(p => p !== activePlayer) : activePlayer)
  const receiver = usePlayerName(isBonus ? activePlayer : move.location.player)

  return <Trans i18nKey="log.token-transfer" values={{ giver, receiver }} />
}
