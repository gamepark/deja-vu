/** @jsxImportSource @emotion/react */
import { endCard } from '@gamepark/deja-vu/material/DejaVuCard'
import { MaterialHelpProps } from '@gamepark/react-game'
import { Trans } from 'react-i18next'
import { css } from '@emotion/react'
import CardEndImg from '../../images/cards/CardEnd.jpg'
import Front12 from '../../images/cards/Front1-2.jpg'
import Back03 from '../../images/cards/Back03.jpg'
import Front23 from '../../images/cards/Front2-3.jpg'
import Front34 from '../../images/cards/Front3-4.jpg'

const bold = <strong />
const components = { bold }

export const DejaVuCardHelp = ({ item }: MaterialHelpProps) => {
  if (item?.id === endCard) {
    return <EndCardHelp />
  }
  return <NormalCardHelp />
}

const NormalCardHelp = () => (
  <>
    <h2><Trans i18nKey="help.card.title" /></h2>

    <h3><Trans i18nKey="help.card.face-blue.title" /></h3>
    <p><Trans i18nKey="help.card.face-blue.desc" components={components} /></p>

    <h3><Trans i18nKey="help.card.face-orange.title" /></h3>
    <p><Trans i18nKey="help.card.face-orange.desc" components={components} /></p>

    <div css={facesExampleCss}>
      <div css={faceGroupCss}>
        <img src={Front12} css={sampleCardCss} alt="face orange : 1 et 2" />
        <span css={faceLabelCss}><Trans i18nKey="help.card.face-orange.label" /></span>
      </div>
      <span css={arrowCss}>↔</span>
      <div css={faceGroupCss}>
        <img src={Back03} css={sampleCardCss} alt="face bleue : 3" />
        <span css={faceLabelCss}><Trans i18nKey="help.card.face-blue.label" /></span>
      </div>
    </div>

    <p><Trans i18nKey="help.card.unique" components={components} /></p>

    <div css={sampleRowCss}>
      <img src={Front12} css={sampleCardCss} alt="" />
      <img src={Front23} css={sampleCardCss} alt="" />
      <img src={Front34} css={sampleCardCss} alt="" />
    </div>

    <h3><Trans i18nKey="help.card.observe.title" /></h3>
    <p><Trans i18nKey="help.card.observe.desc" /></p>
    <h3><Trans i18nKey="help.card.flip.title" /></h3>
    <p><Trans i18nKey="help.card.flip.desc" components={components} /></p>
    <h3><Trans i18nKey="help.card.terminate.title" /></h3>
    <p><Trans i18nKey="help.card.terminate.desc" components={components} /></p>
    <h3><Trans i18nKey="help.card.bonus.title" /></h3>
    <p><Trans i18nKey="help.card.bonus.desc" components={components} /></p>
    <h3><Trans i18nKey="help.card.fail.title" /></h3>
    <p><Trans i18nKey="help.card.fail.desc" components={components} /></p>
    <h3><Trans i18nKey="help.card.score.title" /></h3>
    <p><Trans i18nKey="help.card.score" /></p>
  </>
)

const EndCardHelp = () => (
  <>
    <h2><Trans i18nKey="help.end-card.title" /></h2>
    <div css={endCardImgCss}>
      <img src={CardEndImg} css={sampleCardCss} alt="" />
    </div>
    <p><Trans i18nKey="help.end-card.description" components={components} /></p>
    <p><Trans i18nKey="help.end-card.last-turn" components={components} /></p>
    <p><Trans i18nKey="help.end-card.score" /></p>
  </>
)

const facesExampleCss = css`
  display: flex;
  align-items: center;
  gap: 0.8em;
  margin: 0.6em 0 1em;
`

const faceGroupCss = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3em;
`

const faceLabelCss = css`
  font-size: 0.75em;
  opacity: 0.75;
`

const arrowCss = css`
  font-size: 1.4em;
  opacity: 0.5;
`

const sampleRowCss = css`
  display: flex;
  gap: 0.4em;
  margin: 0.2em 0 0.8em;
`

const sampleCardCss = css`
  height: 5em;
  border-radius: 0.3em;
`

const endCardImgCss = css`
  margin: 0.5em 0 0.8em;
`
