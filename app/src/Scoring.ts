import { DejaVuRules } from '@gamepark/deja-vu/DejaVuRules'
import { ScoreHelper } from '@gamepark/deja-vu/rules/helper/ScoreHelper'
import { ScoringDescription } from '@gamepark/react-game'
import { createElement } from 'react'
import { Trans } from 'react-i18next'
import { GameOverHeader } from './headers/GameOverHeader'

const enum ScoringKey { Cards = 1, Tokens, Total }

export const scoring: ScoringDescription<number, DejaVuRules> = {
  getScoringKeys: (rules) => {
    const scoreHelper = new ScoreHelper(rules.game)
    const isInstinctWin = rules.game.players.some(player => scoreHelper.getTokenCount(player) === 0)
    return isInstinctWin ? [] : [ScoringKey.Cards, ScoringKey.Tokens, ScoringKey.Total]
  },

  getScoringHeader: (key) => {
    if (key === ScoringKey.Cards) return createElement(Trans, { i18nKey: 'score.cards' })
    if (key === ScoringKey.Tokens) return createElement(Trans, { i18nKey: 'score.tokens' })
    return createElement(Trans, { i18nKey: 'score.total' })
  },

  getScoringPlayerData: (key, player, rules) => {
    const scoreHelper = new ScoreHelper(rules.game)
    const tokens = scoreHelper.getTokenCount(player)
    const score = scoreHelper.getScore(player)
    if (key === ScoringKey.Cards) return score - tokens * 0.5
    if (key === ScoringKey.Tokens) return tokens * 0.5
    return score
  },

  ResultHeader: GameOverHeader
}
