import { PlayerColor } from '@gamepark/deja-vu/PlayerColor'
import { MoveComponentProps, usePlayerName } from '@gamepark/react-game'
import { MaterialMove, MoveItem } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'

export const TokenTransferLog = ({ move, context }: MoveComponentProps<MaterialMove>) => {
  const moveItem = move as MoveItem
  const activePlayer = context.game.rule?.player
  const isBonus = moveItem.location.player === activePlayer

  const giver = usePlayerName(isBonus ? (context.game.players as PlayerColor[]).find((p: PlayerColor) => p !== activePlayer) : activePlayer)
  const receiver = usePlayerName(isBonus ? activePlayer : moveItem.location.player)

  return <Trans i18nKey="log.token-transfer" values={{ giver, receiver }} />
}
