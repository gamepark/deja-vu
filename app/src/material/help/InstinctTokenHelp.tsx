/** @jsxImportSource @emotion/react */
import { MaterialHelpProps } from '@gamepark/react-game'
import { Trans } from 'react-i18next'
import { css } from '@emotion/react'
import TokenImg from '../../images/InstinctToken.png'

const bold = <strong />
const components = { bold }

export const InstinctTokenHelp = (_: MaterialHelpProps) => (
  <>
    <h2><Trans i18nKey="help.token.title" /></h2>
    <div css={tokenImgCss}>
      <img src={TokenImg} css={tokenCss} alt="" />
    </div>
    <p><Trans i18nKey="help.token.description" components={components} /></p>
    <h3><Trans i18nKey="help.token.lose.title" /></h3>
    <p><Trans i18nKey="help.token.lose.desc" /></p>
    <h3><Trans i18nKey="help.token.give.title" /></h3>
    <p><Trans i18nKey="help.token.give.desc" /></p>
    <h3><Trans i18nKey="help.token.instinct.title" /></h3>
    <p><Trans i18nKey="help.token.instinct.desc" components={components} /></p>
    <h3><Trans i18nKey="help.token.score.title" /></h3>
    <p><Trans i18nKey="help.token.score.desc" components={components} /></p>
  </>
)

const tokenImgCss = css`
  display: flex;
  justify-content: center;
  margin: 0.5em 0 0.8em;
`

const tokenCss = css`
  height: 4em;
`
