/** @jsxImportSource @emotion/react */
import { MaterialType } from '@gamepark/deja-vu/material/MaterialType'
import { RevealCardRule } from '@gamepark/deja-vu/rules/RevealCardRule'
import { PlayMoveButton, useLegalMove, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { isMoveItemTypeAtOnce } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'

export const RevealCardHeader = () => {
  const playerId = usePlayerId()
  const rules = useRules()!
  const activePlayer = rules.game.rule?.player
  const itsMe = playerId !== undefined && activePlayer === playerId
  const playerName = usePlayerName(activePlayer)
  // Le choix du texte dépend de l'état (peut-on Terminer ?), pas des coups légaux : dans le
  // tutoriel ceux-ci sont filtrés, ce qui afficherait le mauvais en-tête. Le bouton, lui, reste
  // branché sur le coup légal : cliquable en jeu réel, désactivé quand le coup n'est pas autorisé.
  const canTerminate = new RevealCardRule(rules.game).canTerminate
  const terminateMove = useLegalMove(isMoveItemTypeAtOnce(MaterialType.DejaVuCard))

  if (itsMe) {
    if (!canTerminate) {
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
