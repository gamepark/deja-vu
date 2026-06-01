/** @jsxImportSource @emotion/react */
import { ScoreHelper } from '@gamepark/deja-vu/rules/helper/ScoreHelper'
import { usePlayerName, useRankedPlayers, useRules } from '@gamepark/react-game'
import { Trans } from 'react-i18next'

export const GameOverHeader = () => {
  const rules = useRules()!
  const rankedPlayers = useRankedPlayers()
  const winner = rankedPlayers[0]
  const winnerName = usePlayerName(winner.id)

  const scoreHelper = new ScoreHelper(rules.game)

  if (scoreHelper.hasAllTokens(winner.id as number)) {
    return <Trans i18nKey="game.over.instinct" values={{ player: winnerName }} />
  }

  const score = scoreHelper.getScore(winner.id as number)
  return <Trans i18nKey="game.over.winner" values={{ player: winnerName, score }} />
}
