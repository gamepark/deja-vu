/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { ItemButtonProps, ItemMenuButton } from '@gamepark/react-game'
import { HTMLAttributes, ReactNode } from 'react'
import { colors } from './colors'

type Props = ItemButtonProps & HTMLAttributes<HTMLButtonElement> & { children?: ReactNode }

export const DejaVuMenuButton = (props: Props) =>
  <ItemMenuButton css={menuButtonCss} {...props} />

const menuButtonCss = css`
  width: 2.2em;
  height: 2.2em;
  border-radius: 50%;
  background: ${colors.blue};
  border: 0.12em solid ${colors.orange};
  color: ${colors.cream};
  box-shadow: 0 0.15em 0.4em rgba(0, 0, 0, 0.5), inset 0 0.08em 0.12em rgba(255, 255, 255, 0.1);
  transition: background 150ms ease, border-color 150ms ease, box-shadow 150ms ease, margin-top 150ms ease;

  &:hover:not(:disabled) {
    background: ${colors.orange};
    border-color: ${colors.orangeDeep};
    color: ${colors.cream};
    margin-top: -0.12em;
    box-shadow: 0 0.25em 0.5em rgba(0, 0, 0, 0.5);
  }

  &:disabled {
    background: #555;
    border-color: #444;
    color: #999;
    cursor: default;
  }

  > span {
    font-size: 0.82em;
    font-weight: 700;
    color: ${colors.cream};
    background: ${colors.blueDeep};
    border: 0.1em solid ${colors.orange};
    border-radius: 0.35em;
    padding: 0.25em 0.6em;
    box-shadow: 0 0.12em 0.35em rgba(0, 0, 0, 0.6);
    white-space: nowrap;
    letter-spacing: 0.02em;
  }
`
