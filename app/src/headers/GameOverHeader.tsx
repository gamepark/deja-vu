/** @jsxImportSource @emotion/react */
import { DejaVuRules } from '@gamepark/deja-vu/DejaVuRules'
import { ScoreHelper } from '@gamepark/deja-vu/rules/helper/ScoreHelper'
import { usePlayerId, usePlayerName, useRankedPlayers, useRules } from '@gamepark/react-game'
import { Trans } from 'react-i18next'

export const GameOverHeader = () => {
  const rules = useRules<DejaVuRules>()!
  const rankedPlayers = useRankedPlayers<number>()
  const winner = rankedPlayers[0]
  const winnerName = usePlayerName(winner.id)
  const playerId = usePlayerId()
  const itsMe = playerId !== undefined && winner.id === playerId

  const scoreHelper = new ScoreHelper(rules.game)

  const opponent = rules.game.players.find((p) => p !== winner.id)!
  if (scoreHelper.getTokenCount(opponent) === 0) {
    return <Trans i18nKey={itsMe ? 'game.over.instinct.you' : 'game.over.instinct.player'} values={{ player: winnerName }} />
  }

  const score = scoreHelper.getScore(winner.id)
  return <Trans i18nKey={itsMe ? 'game.over.winner.you' : 'game.over.winner.player'} values={{ player: winnerName, score }} />
}
