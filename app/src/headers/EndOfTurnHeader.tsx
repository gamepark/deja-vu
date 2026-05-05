/** @jsxImportSource @emotion/react */
import { CustomMoveType } from '@gamepark/deja-vu/rules/CustomMoveType'
import { PlayMoveButton, useLegalMove, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { isCustomMoveType } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'

export const EndOfTurnHeader = () => {
  const playerId = usePlayerId()
  const rules = useRules()!
  const activePlayer = rules.game.rule?.player
  const itsMe = playerId !== undefined && activePlayer === playerId
  const playerName = usePlayerName(activePlayer)
  const giveTokenMove = useLegalMove(isCustomMoveType(CustomMoveType.GiveTokenToReplay))
  const endTurnMove = useLegalMove(isCustomMoveType(CustomMoveType.EndTurn))

  if (itsMe) {
    return <Trans
      i18nKey="header.end-of-turn.you"
      components={{
        give: <PlayMoveButton move={giveTokenMove!} />,
        end: <PlayMoveButton move={endTurnMove!} />
      }}
    />
  }

  return <Trans i18nKey="header.end-of-turn.player" values={{ player: playerName }} />
}
