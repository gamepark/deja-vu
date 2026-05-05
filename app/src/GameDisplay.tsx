/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { DevToolsHub, GameTable } from '@gamepark/react-game'
import { PlayerPanels } from './panels/PlayerPanels'

export function GameDisplay() {
  const margin = { top: 7, left: 0, right: 0, bottom: 0 }
  return (
    <GameTable xMin={-30} xMax={30} yMin={-15} yMax={15} margin={margin} zoom={false} css={process.env.NODE_ENV === 'development' && tableBorder}>
      <PlayerPanels />
      {process.env.NODE_ENV === 'development' && <DevToolsHub fabBottom="calc(1em + 6em * 1.7)" />}
    </GameTable>
  )
}

const tableBorder = css`
  border: 1px solid white;
`
