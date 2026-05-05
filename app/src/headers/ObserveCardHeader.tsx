/** @jsxImportSource @emotion/react */
import { usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { Trans } from 'react-i18next'

export const ObserveCardHeader = () => {
  const playerId = usePlayerId()
  const rules = useRules()!
  const activePlayer = rules.game.rule?.player
  const itsMe = playerId !== undefined && activePlayer === playerId
  const playerName = usePlayerName(activePlayer)

  if (itsMe) {
    return <Trans i18nKey="header.observe-card.you" />
  }

  return <Trans i18nKey="header.observe-card.player" values={{ player: playerName }} />
}
