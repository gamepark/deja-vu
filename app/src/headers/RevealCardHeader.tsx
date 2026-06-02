/** @jsxImportSource @emotion/react */
import { MaterialType } from '@gamepark/deja-vu/material/MaterialType'
import { PlayMoveButton, useLegalMove, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { isMoveItemTypeAtOnce } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'

export const RevealCardHeader = () => {
  const playerId = usePlayerId()
  const rules = useRules()!
  const activePlayer = rules.game.rule?.player
  const itsMe = playerId !== undefined && activePlayer === playerId
  const playerName = usePlayerName(activePlayer)
  const terminateMove = useLegalMove(isMoveItemTypeAtOnce(MaterialType.DejaVuCard))

  if (itsMe) {
    if (!terminateMove) {
      return <Trans i18nKey="header.reveal.you.flip" />
    }
    return <Trans
      i18nKey="header.reveal.you"
      components={{
        terminate: <PlayMoveButton move={terminateMove} />
      }}
    />
  }

  return <Trans i18nKey="header.reveal.player" values={{ player: playerName }} />
}
