import { endCard } from '@gamepark/deja-vu/material/DejaVuCard'
import { LocationType } from '@gamepark/deja-vu/material/LocationType'
import { MaterialType } from '@gamepark/deja-vu/material/MaterialType'
import { ScoringDescription } from '@gamepark/react-game'
import { GameOverHeader } from './headers/GameOverHeader'

const enum ScoringKey { Cards = 1, Tokens, Total }

export const scoring: ScoringDescription = {
  getScoringKeys: (rules) => {
    const tokens: any[] = rules.game.items?.[MaterialType.InstinctToken] ?? []
    const isInstinctWin = rules.game.players?.some((player: number) =>
      tokens.filter(item => item.location?.player === player).length >= 7
    )
    return isInstinctWin ? [] : [ScoringKey.Cards, ScoringKey.Tokens, ScoringKey.Total]
  },

  getScoringHeader: (key) => {
    if (key === ScoringKey.Cards) return 'Cartes'
    if (key === ScoringKey.Tokens) return 'Jetons (×½)'
    return 'Total'
  },

  getScoringPlayerData: (key, player, rules) => {
    const cards = (rules.game.items?.[MaterialType.DejaVuCard] ?? []).filter((item: any) =>
      item.location?.type === LocationType.PlayerPile &&
      item.location?.player === player &&
      item.id !== endCard
    ).length
    const tokens = (rules.game.items?.[MaterialType.InstinctToken] ?? []).filter((item: any) =>
      item.location?.player === player
    ).length
    if (key === ScoringKey.Cards) return cards
    if (key === ScoringKey.Tokens) return tokens * 0.5
    return cards + tokens * 0.5
  },

  ResultHeader: GameOverHeader
}
