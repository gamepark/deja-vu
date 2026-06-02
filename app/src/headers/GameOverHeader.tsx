/** @jsxImportSource @emotion/react */
import { DejaVuRules } from '@gamepark/deja-vu/DejaVuRules'
import { ScoreHelper } from '@gamepark/deja-vu/rules/helper/ScoreHelper'
import { usePlayerName, useRankedPlayers, useRules } from '@gamepark/react-game'
import { Trans } from 'react-i18next'

export const GameOverHeader = () => {
  const rules = useRules<DejaVuRules>()!
  const rankedPlayers = useRankedPlayers<number>()
  const winner = rankedPlayers[0]
  const winnerName = usePlayerName(winner.id)

  const scoreHelper = new ScoreHelper(rules.game)

  const opponent = rules.game.players.find((p) => p !== winner.id)!
  if (scoreHelper.getTokenCount(opponent) === 0) {
    return <Trans i18nKey="game.over.instinct" values={{ player: winnerName }} />
  }

  const score = scoreHelper.getScore(winner.id)
  return <Trans i18nKey="game.over.winner" values={{ player: winnerName, score }} />
}
