/** @jsxImportSource @emotion/react */
import { INSTINCT_WIN_THRESHOLD } from '@gamepark/deja-vu/GameConstants'
import { PlayerColor } from '@gamepark/deja-vu/PlayerColor'
import { ScoreHelper } from '@gamepark/deja-vu/rules/helper/ScoreHelper'
import { usePlayerName, useRankedPlayers, useRules } from '@gamepark/react-game'
import { Trans } from 'react-i18next'

export const GameOverHeader = () => {
  const rules = useRules()!
  const rankedPlayers = useRankedPlayers()
  const winner = rankedPlayers[0]
  const winnerName = usePlayerName(winner.id)
  const isTie = rankedPlayers.length > 1 && rankedPlayers[1].rank === winner.rank

  const scoreHelper = new ScoreHelper(rules.game)
  const winnerTokenCount = scoreHelper.getTokenCount(winner.id as PlayerColor)

  if (!isTie && winnerTokenCount >= INSTINCT_WIN_THRESHOLD) {
    return <Trans i18nKey="game.over.instinct" values={{ player: winnerName }} />
  }

  if (isTie) {
    return <Trans i18nKey="game.over.tie" />
  }

  const score = scoreHelper.getScore(winner.id as PlayerColor)
  return <Trans i18nKey="game.over.winner" values={{ player: winnerName, score }} />
}
