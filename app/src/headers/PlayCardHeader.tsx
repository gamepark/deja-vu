/** @jsxImportSource @emotion/react */
import { LocationType } from '@gamepark/deja-vu/material/LocationType'
import { MaterialType } from '@gamepark/deja-vu/material/MaterialType'
import { PlayMoveButton, useLegalMove, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { isMoveItemType } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'

export const PlayCardHeader = () => {
  const playerId = usePlayerId()
  const rules = useRules()!
  const activePlayer = rules.game.rule?.player
  const itsMe = playerId !== undefined && activePlayer === playerId
  const playerName = usePlayerName(activePlayer)
  const takeEndCardMove = useLegalMove(
    move => isMoveItemType(MaterialType.DejaVuCard)(move) && move.location.type === LocationType.PlayerPile
  )

  if (itsMe) {
    return <Trans
      i18nKey={takeEndCardMove ? 'header.play-card.end-card.you' : 'header.play-card.you'}
      components={{ take: <PlayMoveButton move={takeEndCardMove!} /> }}
    />
  }

  return <Trans i18nKey="header.play-card.player" values={{ player: playerName }} />
}
