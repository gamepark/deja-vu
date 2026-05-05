import { css } from '@emotion/react'
import { ScoreHelper } from '@gamepark/deja-vu/rules/helper/ScoreHelper'
import { StyledPlayerPanel, usePlayers, useRules } from '@gamepark/react-game'
import { MaterialGame } from '@gamepark/rules-api'
import { createPortal } from 'react-dom'
import CardIcon from '../images/cards/Back03.jpg'
import TokenIcon from '../images/InstinctToken.png'
import Panel1 from '../images/panels/Panel1.png'
import Panel2 from '../images/panels/Panel2.png'

export const PlayerPanels = () => {
  const players = usePlayers<number>({ sortFromMe: true })
  const rules = useRules()
  const root = document.getElementById('root')
  if (!root) return null

  return createPortal(
    <>
      {players.map((player, index) => (
        <StyledPlayerPanel
          key={player.id}
          player={player}
          counters={getCounters(player.id, rules?.game)}
          css={panelPosition(index)}
          activeRing
          backgroundImage={images[player.id]}
        />
      ))}
    </>,
    root
  )
}

const getCounters = (player: number, game?: MaterialGame) => {
  if (!game) return []
  const helper = new ScoreHelper(game)
  return [
    { image: CardIcon, value: helper.getCardCount(player) },
    { image: TokenIcon, value: helper.getTokenCount(player) }
  ]
}

const panelPosition = (index: number) => css`
  position: absolute;
  width: 28em;
  border: 0;
  ${index === 0 ? bottomLeft : bottomRight}
`

const bottomLeft = css`
  bottom: 1em;
  left: 1em;
`

const bottomRight = css`
  bottom: 1em;
  right: 1em;
`

const images: Record<number, string> = {
  1: Panel1,
  2: Panel2,
}
