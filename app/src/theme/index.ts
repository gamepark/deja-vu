import { css } from '@emotion/react'
import { defaultTheme, GameTheme } from '@gamepark/react-game'
import { colors } from './colors'
import { fontBody, fontDisplay } from './typography'

const dialogContainer = css`
  box-shadow:
    0 0 0 0.1em rgba(212, 98, 26, 0.4),
    0 0.6em 1.5em rgba(0, 0, 0, 0.5);
`

const buttonBase = css`
  background: ${colors.blue} !important;
  color: ${colors.cream} !important;
  border: 0.15em solid ${colors.orange} !important;
  border-radius: 0.4em !important;
  padding: 0.4em 1em !important;
  font-family: ${fontDisplay};
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: 0 0.2em 0.35em rgba(0, 0, 0, 0.3);
  transition: background 150ms ease, color 150ms ease, border-color 150ms ease, transform 120ms ease;
  outline: none !important;

  &:hover:not(:disabled),
  &:focus:hover:not(:disabled) {
    background: ${colors.orange} !important;
    color: ${colors.cream} !important;
    border-color: ${colors.orangeDeep} !important;
  }

  &:focus:not(:hover):not(:disabled) {
    background: ${colors.blue} !important;
    color: ${colors.cream} !important;
    border-color: ${colors.orangeLight} !important;
  }

  &:active:not(:disabled) {
    background: ${colors.orangeDeep} !important;
    color: ${colors.cream} !important;
    transform: translateY(0.05em);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

const headerBar = css`
  background: rgba(15, 34, 80, 0.93);
  border-bottom: 0.15em solid ${colors.orange};
  color: ${colors.cream};
  font-family: ${fontDisplay};
  box-shadow: 0 0.2em 0.5em rgba(0, 0, 0, 0.5);

  h1 {
    color: ${colors.cream};
    font-weight: 700;
  }

  b, strong {
    color: ${colors.orangeLight};
  }
`

const headerButtons = css`
  background: transparent !important;
  color: ${colors.cream} !important;
  border: 0.08em solid rgba(242, 234, 216, 0.55) !important;
  border-radius: 0.35em !important;
  font-family: ${fontDisplay};
  font-weight: 700;
  cursor: pointer;
  padding: 0 0.45em !important;
  box-shadow: none !important;
  outline: none !important;
  transition: background 150ms ease, color 150ms ease;

  &:hover:not(:disabled),
  &:focus:hover:not(:disabled) {
    background: ${colors.orange} !important;
    color: ${colors.cream} !important;
    border-color: ${colors.orangeDeep} !important;
  }

  &:focus:not(:hover):not(:disabled) {
    background: transparent !important;
    color: ${colors.cream} !important;
  }

  &:active:not(:disabled) {
    background: ${colors.orangeDeep} !important;
    color: ${colors.cream} !important;
  }
`

const journalHistoryEntry = css`
  background-color: rgba(27, 58, 114, 0.88) !important;
  border: 0.08em solid rgba(212, 98, 26, 0.2) !important;
  border-left: 0.3em solid ${colors.orange} !important;
  border-radius: 0.4em !important;
  color: ${colors.cream} !important;
  font-family: ${fontBody} !important;
  padding: 0.55em 0.8em 0.55em 0.9em !important;
  margin: 0.35em 0 !important;
  box-sizing: border-box !important;
  box-shadow: 0 0.15em 0.3em rgba(0, 0, 0, 0.35) !important;

  strong, b { color: ${colors.orangeLight}; font-weight: 700; }
`

const menuPanel = css`
  background: ${colors.cream};
  color: ${colors.blue};
  border: 0.05em solid ${colors.blue};
  box-shadow:
    0 0 0 0.1em rgba(212, 98, 26, 0.35),
    0 0.6em 1.5em rgba(0, 0, 0, 0.4);
  font-family: ${fontDisplay};

  h2 {
    color: ${colors.blue};
    border-bottom: 0.15em solid ${colors.orange};
    padding-bottom: 0.3em;
  }
`

const menuMainButton = css`
  background: ${colors.orange} !important;
  color: ${colors.cream} !important;
  border: 0.15em solid ${colors.orangeDeep} !important;
  outline: none !important;

  &:hover:not(:disabled) {
    background: ${colors.orangeDeep} !important;
  }

  &:focus:not(:hover):not(:disabled) {
    background: ${colors.orange} !important;
  }
`

const tutorialContainer = css`
  font-family: ${fontBody};
  color: ${colors.blue};
  background: ${colors.cream};

  h2, h3 {
    font-family: ${fontDisplay};
    color: ${colors.blue};
  }

  strong, b { color: ${colors.orangeDeep}; }
`

export const theme: GameTheme = {
  ...defaultTheme,
  root: {
    ...defaultTheme.root,
    fontFamily: fontBody
  },
  palette: {
    primary: colors.blue,
    primaryHover: colors.blueLight,
    primaryActive: colors.blueDeep,
    primaryLight: colors.cream,
    primaryLighter: colors.creamSoft,
    surface: colors.cream,
    onSurface: colors.blue,
    onSurfaceFocus: colors.creamSoft,
    onSurfaceActive: '#E0D8C0',
    danger: '#C13737',
    dangerHover: '#9E2828',
    dangerActive: '#7A1E1E',
    disabled: '#6B6B6B'
  },
  buttons: buttonBase,
  dialog: {
    ...defaultTheme.dialog,
    backgroundColor: colors.cream,
    color: colors.blue,
    container: dialogContainer,
    buttons: buttonBase
  },
  journal: {
    ...(defaultTheme.journal ?? {}),
    historyEntry: journalHistoryEntry
  },
  header: {
    bar: headerBar,
    buttons: headerButtons
  },
  menu: {
    panel: menuPanel,
    mainButton: menuMainButton
  },
  playerPanel: {
    activeRingColors: [colors.orange, colors.blue]
  },
  tutorial: {
    container: tutorialContainer
  }
}
