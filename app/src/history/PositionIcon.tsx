/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import Position0 from '../images/icons/Position0.png'
import Position1 from '../images/icons/Position1.png'
import Position2 from '../images/icons/Position2.png'
import Position3 from '../images/icons/Position3.png'
import Position4 from '../images/icons/Position4.png'
import Position5 from '../images/icons/Position5.png'
import Position6 from '../images/icons/Position6.png'
import Position7 from '../images/icons/Position7.png'
import PositionDeck from '../images/icons/PositionDeck.png'

const gridIcons: Record<number, string> = {
  0: Position0, 1: Position1, 2: Position2, 3: Position3,
  4: Position4, 5: Position5, 6: Position6, 7: Position7,
}

type Props = { x?: number }

export const PositionIcon = ({ x }: Props) => {
  const src = x !== undefined && gridIcons[x] !== undefined ? gridIcons[x] : PositionDeck
  return <img src={src} alt="" css={iconCss} />
}

const iconCss = css`
  display: inline-block;
  height: 2.2em;
  vertical-align: -0.6em !important;
  margin: 0 0.15em;
  background: white;
  border-radius: 0.2em;
  padding: 0.1em;
`
