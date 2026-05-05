/** @jsxImportSource @emotion/react */
import { endCard } from '@gamepark/deja-vu/material/DejaVuCard'
import { LocationType } from '@gamepark/deja-vu/material/LocationType'
import { MaterialType } from '@gamepark/deja-vu/material/MaterialType'
import { usePlayerName, useRankedPlayers, useRules } from '@gamepark/react-game'
import { Trans } from 'react-i18next'

export const GameOverHeader = () => {
  const rules = useRules()!
  const rankedPlayers = useRankedPlayers()
  const winner = rankedPlayers[0]
  const winnerName = usePlayerName(winner.id)
  const isTie = rankedPlayers.length > 1 && rankedPlayers[1].rank === winner.rank

  const winnerTokenCount = (rules.game.items[MaterialType.InstinctToken] ?? [])
    .filter((item: any) => item.location.player === winner.id).length

  if (!isTie && winnerTokenCount >= 7) {
    return <Trans i18nKey="game.over.instinct" values={{ player: winnerName }} />
  }

  if (isTie) {
    return <Trans i18nKey="game.over.tie" />
  }

  const cards = (rules.game.items[MaterialType.DejaVuCard] ?? []).filter((item: any) =>
    item.location.type === LocationType.PlayerPile &&
    item.location.player === winner.id &&
    item.id !== endCard
  ).length
  const score = cards + winnerTokenCount * 0.5

  return <Trans i18nKey="game.over.winner" values={{ player: winnerName, score }} />
}
