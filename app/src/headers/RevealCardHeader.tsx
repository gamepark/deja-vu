/** @jsxImportSource @emotion/react */
import { CustomMoveType } from '@gamepark/deja-vu/rules/CustomMoveType'
import { PlayMoveButton, useLegalMove, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { isCustomMoveType } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'

export const RevealCardHeader = () => {
  const playerId = usePlayerId()
  const rules = useRules()!
  const activePlayer = rules.game.rule?.player
  const itsMe = playerId !== undefined && activePlayer === playerId
  const playerName = usePlayerName(activePlayer)
  const terminateMove = useLegalMove(isCustomMoveType(CustomMoveType.Terminate))

  if (itsMe) {
    return <Trans
      i18nKey="header.reveal.you"
      components={{
        terminate: <PlayMoveButton move={terminateMove!} />
      }}
    />
  }

  return <Trans i18nKey="header.reveal.player" values={{ player: playerName }} />
}
