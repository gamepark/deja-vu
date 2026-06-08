/** @jsxImportSource @emotion/react */
import { LocationType } from '@gamepark/deja-vu/material/LocationType'
import { MaterialType } from '@gamepark/deja-vu/material/MaterialType'
import { CustomMoveType } from '@gamepark/deja-vu/rules/CustomMoveType'
import { MaterialTutorial, TutorialStep } from '@gamepark/react-game'
import { isCustomMoveType, isMoveItemType, isMoveItemTypeAtOnce } from '@gamepark/rules-api'
import React from 'react'
import { Trans } from 'react-i18next'
import ObserverIcon from '../images/icons/observer.png'
import RevelerIcon from '../images/icons/reveler.png'
import { REVEAL_END_CARD_VIEW } from '../locators/DejaVuCardsDeckLocator'
import { me, opponent, TutorialSetup } from './TutorialSetup'

const C = {
  bold: <strong/>,
  br: <br/>
}

const actionRowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.5em', margin: '0.4em 0' }
const actionIconStyle: React.CSSProperties = { height: '2em', flexShrink: 0 }

const ActionsText = () => (
  <>
    <Trans i18nKey="tuto.actions.intro" components={C}/>
    <span style={actionRowStyle}>
      <img src={ObserverIcon} style={actionIconStyle} alt=""/>
      <span><Trans i18nKey="tuto.actions.observe" components={C}/></span>
    </span>
    <span style={actionRowStyle}>
      <img src={RevelerIcon} style={actionIconStyle} alt=""/>
      <span><Trans i18nKey="tuto.actions.reveal" components={C}/></span>
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
      popup: { text: () => <Trans i18nKey="tuto.welcome" components={C}/> }
    },

    // ─── 2. Les cartes (2 faces) ─────────────────────────────────────────────
    {
      popup: { text: () => <Trans i18nKey="tuto.cards" components={C}/>, position: { y: 30 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.DejaVuCard)], margin: { top: 2, bottom: 2, left: 2, right: 2 } })
    },

    // ─── 3. Les 2 actions ────────────────────────────────────────────────────
    {
      popup: { text: () => <ActionsText/> }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // TOUR 1 JOUEUR — Observer item0 (card24: 2,4) en x=0
    // ═══════════════════════════════════════════════════════════════════════════
    {
      popup: { text: () => <Trans i18nKey="tuto.observe-intro" components={C}/>, position: { x: 10, y: 10 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.DejaVuCard).location((l) => l.type === LocationType.Grid && l.x === 0)],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      }),
      move: {
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          move.location.type === LocationType.PlayerShowCard &&
          move.location.player === me &&
          move.itemIndex === 0
      }
    },
    {
      popup: { text: () => <Trans i18nKey="tuto.observe-see" components={C}/>, position: { x: -30, y: 5 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.DejaVuCard).location((l) => l.type === LocationType.PlayerShowCard && l.player === me)],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      }),
      move: {
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          (move.location.type === LocationType.Grid || move.location.type === LocationType.Deck) &&
          move.itemIndex === 0
      }
    },
    {
      popup: { text: () => <Trans i18nKey="tuto.end-of-turn" components={C}/> },
      move: { filter: (move) => isCustomMoveType(CustomMoveType.EndTurn)(move) }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // TOUR 1 NICO — Observer item2 (card34: 3,4) en x=2 (auto)
    // ═══════════════════════════════════════════════════════════════════════════
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
      popup: {
        text: () => <Trans i18nKey="tuto.opponent-turn" components={C}/>,
        position: { x: -10, y: 20 }
      },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.DejaVuCard).location((l) => l.type === LocationType.PlayerShowCard && l.player === opponent)],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      })
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
      popup: { text: () => <Trans i18nKey="tuto.observe-turn2" components={C}/> },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.DejaVuCard).location((l) => l.type === LocationType.Grid && l.x === 1)],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      }),
      move: {
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          move.location.type === LocationType.PlayerShowCard &&
          move.location.player === me &&
          move.itemIndex === 1
      }
    },
    {
      popup: { text: () => <Trans i18nKey="tuto.observe-see-2" components={C}/>, position: { x: -30, y: 5 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.DejaVuCard).location((l) => l.type === LocationType.PlayerShowCard && l.player === me)],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      }),
      move: {
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          (move.location.type === LocationType.Grid || move.location.type === LocationType.Deck) &&
          move.itemIndex === 1
      }
    },
    {
      popup: { text: () => <Trans i18nKey="tuto.end-of-turn" components={C}/> },
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
      popup: {
        text: () => <Trans i18nKey="tuto.opponent-turn2" components={C}/>,
        position: { x: -10, y: 20 }
      },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.DejaVuCard).location((l) => l.type === LocationType.PlayerShowCard && l.player === opponent)],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      })
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
      popup: {
        text: () => <Trans i18nKey="tuto.use-memory" components={C}/>,
        position: { x: -35, y: 5 }
      },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.DejaVuCard).location((l) => l.type === LocationType.Grid && l.x === 4)],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      }),
      move: {
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          move.location.type === LocationType.Grid &&
          move.location.rotation === true &&
          move.itemIndex === 4
      }
    },

    // Explication Révéler : succès (3× même chiffre) vs échec (2 cartes sans chiffre commun)
    {
      popup: {
        text: () => <Trans i18nKey="tuto.reveal" components={C}/>,
        position: { x: -35, y: 5 }
      },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.DejaVuCard).location((l) => l.type === LocationType.Grid && l.x === 4)],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      })
    },

    // Révéler card44 (x=1) — l'observée au tour 2
    {
      popup: {
        text: () => <Trans i18nKey="tuto.flip-more" components={C}/>,
        position: { x: -35, y: 5 }
      },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.DejaVuCard).location((l) => l.type === LocationType.Grid && (l.x === 1 || l.x === 4))],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      }),
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
      popup: { text: () => <Trans i18nKey="tuto.flip-can-terminate" components={C}/>, position: { x: -35, y: 10 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.DejaVuCard).location((l) => l.type === LocationType.Grid && (l.x === 1 || l.x === 4))],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      })
    },
    {
      popup: { text: () => <Trans i18nKey="tuto.flip-fourth" components={C}/>, position: { x: -35, y: 10 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.DejaVuCard).location((l) => l.type === LocationType.Grid && (l.x === 0 || l.x === 1 || l.x === 4))],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      }),
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
      popup: { text: () => <Trans i18nKey="tuto.terminate" components={C}/>, position: { x: -35, y: 10 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.DejaVuCard).location((l) => (l.type === LocationType.Grid || l.type === LocationType.Deck) && l.rotation === true)],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      }),
      move: {
        filter: (move) => isMoveItemTypeAtOnce(MaterialType.DejaVuCard)(move),
        // On suspend TOUTES les conséquences dès le réapprovisionnement de la grille. Le refill sera
        // rejoué à la fermeture du popup "tuto.refill", puis le vol du jeton à la fermeture de
        // "tuto.terminate-result" : interrupts chaînés step après step.
        interrupt: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          move.location.type === LocationType.Grid
      }
    },

    // Réapprovisionnement de la grille : rejoué à la fermeture de ce popup, mais on re-suspend
    // juste avant le vol du jeton instinct (gardé pour le popup "tuto.terminate-result" suivant).
    {
      popup: { text: () => <Trans i18nKey="tuto.refill" components={C}/>, position: { x: -35, y: 30 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.DejaVuCard).location((l) => l.type === LocationType.Grid || l.type === LocationType.Deck)],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      }),
      move: {
        interrupt: (move) =>
          isMoveItemType(MaterialType.InstinctToken)(move) &&
          move.location.type === LocationType.PlayerTokenPile &&
          move.location.player === me
      }
    },

    // 1. Les cartes remportées valent 1 point chacune (le vol du jeton reste suspendu).
    {
      popup: { text: () => <Trans i18nKey="tuto.terminate-result" components={C}/>, position: { x: 10, y: 0 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.DejaVuCard).location(LocationType.PlayerPile).player(me)],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      })
    },

    // 2. Présentation des jetons instinct : 7 au total, 3 pour le joueur, 4 pour l'adversaire.
    {
      popup: { text: () => <Trans i18nKey="tuto.tokens-intro" components={C}/>, position: { x: 0, y: -15 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.InstinctToken).location(LocationType.PlayerTokenPile)],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      })
    },

    // 3. Le bonus (4× le même chiffre) : on débloque ici l'interrupt → le jeton est volé à la fermeture.
    {
      popup: { text: () => <Trans i18nKey="tuto.tokens-bonus" components={C}/>, position: { x: 0, y: -15 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.InstinctToken).location(LocationType.PlayerTokenPile)],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      }),
      move: {}
    },

    // 4. Conditions liées aux jetons : 7 jetons = victoire immédiate, sinon 0,5 point chacun.
    {
      popup: { text: () => <Trans i18nKey="tuto.tokens-instinct" components={C}/>, position: { x: 0, y: -15 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.InstinctToken).location(LocationType.PlayerTokenPile)],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      })
    },

    // Fin du tour 3 — explication donner jeton pour rejouer
    {
      popup: { text: () => <Trans i18nKey="tuto.end-of-turn-2" components={C}/>, position: { x: 0, y: -15 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.InstinctToken).location(LocationType.PlayerTokenPile)],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      }),
      move: { filter: (move) => isCustomMoveType(CustomMoveType.EndTurn)(move) }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // TOUR 3 NICO — Révéler item5 (card26: 2,6) puis item6 (card07: 0,7) → ÉCHEC
    // ═══════════════════════════════════════════════════════════════════════════
    // 1er retournement de l'adversaire (il joue directement, sans popup d'intro).
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
    // L'adversaire a choisi de révéler des cartes.
    {
      popup: { text: () => <Trans i18nKey="tuto.nico-turn3-intro" components={C}/> },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.DejaVuCard).location((l) => l.type === LocationType.Grid && l.rotation === true)],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      })
    },
    {
      move: {
        player: opponent,
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          move.location.type === LocationType.Grid &&
          move.location.rotation === true &&
          move.itemIndex === 6,
        // Échec : on suspend toutes les conséquences AVANT que les cartes ne soient retournées
        // face cachée, pour qu'elles restent visibles pendant le popup "fail-intro". À la fermeture
        // du popup "fail-result", le retournement face cachée ET le don du jeton sont rejoués.
        interrupt: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          (move.location.type === LocationType.Grid || move.location.type === LocationType.Deck) &&
          !move.location.rotation
      }
    },
    // Le 0+7 ne partage aucun chiffre avec le 2+6 : les deux cartes sont encore face visible ici.
    {
      popup: { text: () => <Trans i18nKey="tuto.fail-result" components={C}/> },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.InstinctToken).location(LocationType.PlayerTokenPile).player(me)],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      }),
      move: {}
    },

    // ─── Carte Fin ───────────────────────────────────────────────────────────
    // `view` sort la carte Fin du paquet (voir DejaVuCardsDeckLocator) pour la dévoiler le temps du popup.
    {
      view: REVEAL_END_CARD_VIEW,
      popup: { text: () => <Trans i18nKey="tuto.end-card" components={C}/>, position: { x: -35, y: -20 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.DejaVuCard).location(LocationType.Deck)],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      })
    },

    // ─── Conclusion ──────────────────────────────────────────────────────────
    {
      popup: { text: () => <Trans i18nKey="tuto.conclusion" components={C}/> }
    }
  ]
}
