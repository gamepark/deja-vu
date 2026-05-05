import { INSTINCT_WIN_THRESHOLD } from '@gamepark/deja-vu/GameConstants'
import { PlayerColor } from '@gamepark/deja-vu/PlayerColor'
import { ScoreHelper } from '@gamepark/deja-vu/rules/helper/ScoreHelper'
import { ScoringDescription } from '@gamepark/react-game'
import { GameOverHeader } from './headers/GameOverHeader'

const enum ScoringKey { Cards = 1, Tokens, Total }

export const scoring: ScoringDescription = {
  getScoringKeys: (rules) => {
    const scoreHelper = new ScoreHelper(rules.game)
    const isInstinctWin = (rules.game.players as PlayerColor[]).some(
      player => scoreHelper.getTokenCount(player) >= INSTINCT_WIN_THRESHOLD
    )
    return isInstinctWin ? [] : [ScoringKey.Cards, ScoringKey.Tokens, ScoringKey.Total]
  },

  getScoringHeader: (key) => {
    if (key === ScoringKey.Cards) return 'Cartes'
    if (key === ScoringKey.Tokens) return 'Jetons (×½)'
    return 'Total'
  },

  getScoringPlayerData: (key, player, rules) => {
    const scoreHelper = new ScoreHelper(rules.game)
    const tokens = scoreHelper.getTokenCount(player as PlayerColor)
    const score = scoreHelper.getScore(player as PlayerColor)
    if (key === ScoringKey.Cards) return score - tokens * 0.5
    if (key === ScoringKey.Tokens) return tokens * 0.5
    return score
  },

  ResultHeader: GameOverHeader
}
