/** @jsxImportSource @emotion/react */
import { LocationType } from '@gamepark/deja-vu/material/LocationType'
import { MaterialType } from '@gamepark/deja-vu/material/MaterialType'
import { CustomMoveType } from '@gamepark/deja-vu/rules/CustomMoveType'
import { MaterialTutorial, TutorialStep } from '@gamepark/react-game'
import { isCustomMoveType, isMoveItemType, isMoveItemTypeAtOnce } from '@gamepark/rules-api'
import React from 'react'
import { Trans } from 'react-i18next'
import { me, opponent, TutorialSetup } from './TutorialSetup'
import ObserverIcon from '../images/icons/observer.png'
import RevelerIcon from '../images/icons/reveler.png'

const C = {
  bold: <strong />,
  br: <br />,
}

const actionRowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.5em', margin: '0.4em 0' }
const actionIconStyle: React.CSSProperties = { height: '2em', flexShrink: 0 }

const ActionsText = () => (
  <>
    <Trans i18nKey="tuto.actions.intro" components={C} />
    <span style={actionRowStyle}>
      <img src={ObserverIcon} style={actionIconStyle} alt="" />
      <span><Trans i18nKey="tuto.actions.observe" components={C} /></span>
    </span>
    <span style={actionRowStyle}>
      <img src={RevelerIcon} style={actionIconStyle} alt="" />
      <span><Trans i18nKey="tuto.actions.reveal" components={C} /></span>
    </span>
  </>
)

export class Tutorial extends MaterialTutorial<number, MaterialType, LocationType> {
  version = 3

  players = [
    { id: me },
    {
      id: opponent,
      name: 'Nico',
      avatar: {
        topType: 'ShortHairShortWaved',
        accessoriesType: 'Blank',
        hairColor: 'Black',
        facialHairType: 'BeardMedium',
        facialHairColor: 'Black',
        clotheType: 'ShirtCrewNeck',
        clotheColor: 'Gray01',
        eyeType: 'Happy',
        eyebrowType: 'Default',
        mouthType: 'Smile',
        skinColor: 'Light'
      }
    }
  ]

  options = { players: 2 }
  setup = new TutorialSetup()

  steps: TutorialStep[] = [
    // ─── 1. Bienvenue ────────────────────────────────────────────────────────
    {
      popup: { text: () => <Trans i18nKey="tuto.welcome" components={C} /> }
    },

    // ─── 2. Les cartes (2 faces) ─────────────────────────────────────────────
    {
      popup: { text: () => <Trans i18nKey="tuto.cards" components={C} />, position: { y: 30 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.DejaVuCard)], margin: { top: 2, bottom: 2, left: 2, right: 2 } })
    },

    // ─── 3. Les 2 actions ────────────────────────────────────────────────────
    {
      popup: { text: () => <ActionsText /> }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // TOUR 1 JOUEUR — Observer item0 (card24: 2,4) en x=0
    // ═══════════════════════════════════════════════════════════════════════════
    {
      popup: { text: () => <Trans i18nKey="tuto.observe-intro" components={C} />, position: { y: 30 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.DejaVuCard).location((l) => l.type === LocationType.Grid && l.x === 0)], margin: { top: 2, bottom: 2, left: 2, right: 2 } }),
      move: {
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          move.location.type === LocationType.PlayerShowCard &&
          move.location.player === me &&
          move.itemIndex === 0
      }
    },
    {
      popup: { text: () => <Trans i18nKey="tuto.observe-see" components={C} />, position: { x: -30, y: 5 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.DejaVuCard).location((l) => l.type === LocationType.PlayerShowCard && l.player === me)], margin: { top: 2, bottom: 2, left: 2, right: 2 } }),
      move: {
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          (move.location.type === LocationType.Grid || move.location.type === LocationType.Deck) &&
          move.itemIndex === 0
      }
    },
    {
      popup: { text: () => <Trans i18nKey="tuto.end-of-turn" components={C} /> },
      move: { filter: (move) => isCustomMoveType(CustomMoveType.EndTurn)(move) }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // TOUR 1 NICO — Observer item2 (card34: 3,4) en x=2 (auto)
    // ═══════════════════════════════════════════════════════════════════════════
    {
      popup: { text: () => <Trans i18nKey="tuto.opponent-turn" components={C} /> }
    },
    {
      move: {
        player: opponent,
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          move.location.type === LocationType.PlayerShowCard &&
          move.location.player === opponent &&
          move.itemIndex === 2
      }
    },
    {
      move: {
        player: opponent,
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          (move.location.type === LocationType.Grid || move.location.type === LocationType.Deck) &&
          move.itemIndex === 2
      }
    },
    {
      move: {
        player: opponent,
        filter: (move) => isCustomMoveType(CustomMoveType.EndTurn)(move)
      }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // TOUR 2 JOUEUR — Observer item1 (card44: 4,4) en x=1
    // ═══════════════════════════════════════════════════════════════════════════
    {
      popup: { text: () => <Trans i18nKey="tuto.observe-turn2" components={C} />, position: { y: 30 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.DejaVuCard).location((l) => l.type === LocationType.Grid && l.x === 1)], margin: { top: 2, bottom: 2, left: 2, right: 2 } }),
      move: {
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          move.location.type === LocationType.PlayerShowCard &&
          move.location.player === me &&
          move.itemIndex === 1
      }
    },
    {
      popup: { text: () => <Trans i18nKey="tuto.observe-see-2" components={C} />, position: { x: -30, y: 5 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.DejaVuCard).location((l) => l.type === LocationType.PlayerShowCard && l.player === me)], margin: { top: 2, bottom: 2, left: 2, right: 2 } }),
      move: {
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          (move.location.type === LocationType.Grid || move.location.type === LocationType.Deck) &&
          move.itemIndex === 1
      }
    },
    {
      move: { filter: (move) => isCustomMoveType(CustomMoveType.EndTurn)(move) }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // TOUR 2 NICO — Observer item3 (card35: 3,5) en x=3 (auto)
    // ═══════════════════════════════════════════════════════════════════════════
    {
      move: {
        player: opponent,
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          move.location.type === LocationType.PlayerShowCard &&
          move.location.player === opponent &&
          move.itemIndex === 3
      }
    },
    {
      move: {
        player: opponent,
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          (move.location.type === LocationType.Grid || move.location.type === LocationType.Deck) &&
          move.itemIndex === 3
      }
    },
    {
      move: {
        player: opponent,
        filter: (move) => isCustomMoveType(CustomMoveType.EndTurn)(move)
      }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // TOUR 3 JOUEUR — Révéler item4 (card45: 4,5) puis item1 (card44: 4,4) puis item0 (card24: 2,4)
    // ═══════════════════════════════════════════════════════════════════════════

    // Révéler card45 (x=4)
    {
      popup: { text: () => <Trans i18nKey="tuto.use-memory" components={C} />, position: { y: 30 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.DejaVuCard).location((l) => l.type === LocationType.Grid && l.x === 4)], margin: { top: 2, bottom: 2, left: 2, right: 2 } }),
      move: {
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          move.location.type === LocationType.Grid &&
          move.location.rotation === true &&
          move.itemIndex === 4
      }
    },

    // Révéler card44 (x=1) — l'observée au tour 2
    {
      popup: { text: () => <Trans i18nKey="tuto.flip-more" components={C} />, position: { x: 30, y: 10 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.DejaVuCard).location((l) => l.type === LocationType.Grid && (l.x === 1 || l.x === 4))], margin: { top: 2, bottom: 2, left: 2, right: 2 } }),
      move: {
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          move.location.type === LocationType.Grid &&
          move.location.rotation === true &&
          move.itemIndex === 1
      }
    },

    // 3× chiffre 4 → pourrait Terminer, mais bonus possible avec card24
    {
      popup: { text: () => <Trans i18nKey="tuto.flip-can-terminate" components={C} />, position: { x: 30, y: 5 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.DejaVuCard).location((l) => l.type === LocationType.Grid && (l.x === 0 || l.x === 1 || l.x === 4))], margin: { top: 2, bottom: 2, left: 2, right: 2 } })
    },

    // Révéler card24 (x=0) — l'observée au tour 1 → 4× chiffre 4 = bonus!
    {
      focus: (game) => ({ materials: [this.material(game, MaterialType.DejaVuCard).location((l) => l.type === LocationType.Grid && l.x === 0)], margin: { top: 2, bottom: 2, left: 2, right: 2 } }),
      move: {
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          move.location.type === LocationType.Grid &&
          move.location.rotation === true &&
          move.itemIndex === 0
      }
    },

    // Terminer (4× chiffre 4 → bonus déclenché automatiquement)
    {
      popup: { text: () => <Trans i18nKey="tuto.terminate" components={C} />, position: { x: 30, y: 10 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.DejaVuCard).location((l) => (l.type === LocationType.Grid || l.type === LocationType.Deck) && l.rotation === true)], margin: { top: 2, bottom: 2, left: 2, right: 2 } }),
      move: { filter: (move) => isMoveItemTypeAtOnce(MaterialType.DejaVuCard)(move) }
    },

    // Résultat : 3 cartes dans la pile + bonus token volé
    {
      popup: { text: () => <Trans i18nKey="tuto.terminate-result" components={C} /> },
      focus: (game) => ({ materials: [this.material(game, MaterialType.InstinctToken).location(LocationType.PlayerTokenPile)], margin: { top: 2, bottom: 2, left: 2, right: 2 } })
    },

    // Fin du tour 3 — explication donner jeton pour rejouer
    {
      popup: { text: () => <Trans i18nKey="tuto.end-of-turn-2" components={C} /> },
      move: { filter: (move) => isCustomMoveType(CustomMoveType.EndTurn)(move) }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // TOUR 3 NICO — Révéler item5 (card26: 2,6) puis item6 (card07: 0,7) → ÉCHEC
    // ═══════════════════════════════════════════════════════════════════════════
    {
      popup: { text: () => <Trans i18nKey="tuto.nico-turn3-intro" components={C} /> }
    },
    {
      move: {
        player: opponent,
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          move.location.type === LocationType.Grid &&
          move.location.rotation === true &&
          move.itemIndex === 5
      }
    },
    {
      move: {
        player: opponent,
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          move.location.type === LocationType.Grid &&
          move.location.rotation === true &&
          move.itemIndex === 6
      }
    },
    {
      popup: { text: () => <Trans i18nKey="tuto.fail-result" components={C} />, position: { x: 30, y: 5 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.InstinctToken).location(LocationType.PlayerTokenPile).player(me)], margin: { top: 2, bottom: 2, left: 2, right: 2 } })
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // TOUR 4 JOUEUR (libre) — Explication jetons instinct
    // ═══════════════════════════════════════════════════════════════════════════
    {
      popup: { text: () => <Trans i18nKey="tuto.tokens-intro" components={C} />, position: { x: 0, y: -15 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.InstinctToken).location(LocationType.PlayerTokenPile)], margin: { top: 2, bottom: 2, left: 2, right: 2 } })
    },
    {
      popup: { text: () => <Trans i18nKey="tuto.tokens-replay" components={C} />, position: { x: 0, y: -15 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.InstinctToken).location(LocationType.PlayerTokenPile).player(me)], margin: { top: 2, bottom: 2, left: 2, right: 2 } })
    },
    {
      popup: { text: () => <Trans i18nKey="tuto.tokens-instinct" components={C} /> }
    },

    // ─── Carte Fin ───────────────────────────────────────────────────────────
    {
      popup: { text: () => <Trans i18nKey="tuto.end-card" components={C} />, position: { y: 30 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.DejaVuCard).location(LocationType.Deck)], margin: { top: 2, bottom: 2, left: 2, right: 2 } })
    },

    // ─── Score ───────────────────────────────────────────────────────────────
    {
      popup: { text: () => <Trans i18nKey="tuto.scoring" components={C} /> }
    },

    // ─── Conclusion ──────────────────────────────────────────────────────────
    {
      popup: { text: () => <Trans i18nKey="tuto.conclusion" components={C} /> }
    }
  ]
}
