/** @jsxImportSource @emotion/react */
import { LocationType } from '@gamepark/deja-vu/material/LocationType'
import { MaterialType } from '@gamepark/deja-vu/material/MaterialType'
import { CustomMoveType } from '@gamepark/deja-vu/rules/CustomMoveType'
import { MaterialTutorial, TutorialStep } from '@gamepark/react-game'
import { isCustomMoveType, isMoveItemType } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'
import { me, opponent, TutorialSetup } from './TutorialSetup'

const C = {
  bold: <strong />,
  br: <br />,
}

export class Tutorial extends MaterialTutorial<number, MaterialType, LocationType> {
  version = 2

  players = [
    { id: me },
    {
      id: opponent,
      name: 'Alex',
      avatar: {
        topType: 'ShortHairTheCaesar',
        accessoriesType: 'Blank',
        hairColor: 'BrownDark',
        facialHairType: 'Blank',
        clotheType: 'GraphicShirt',
        clotheColor: 'Blue03',
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
      popup: {
        text: () => <Trans i18nKey="tuto.welcome" components={C} />
      }
    },

    // ─── 2. Les cartes ───────────────────────────────────────────────────────
    {
      popup: {
        text: () => <Trans i18nKey="tuto.cards" components={C} />,
        position: { y: 30 }
      },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.DejaVuCard)
        ],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      })
    },

    // ─── 3. Observer une carte ───────────────────────────────────────────────
    // Grid[3] = card45 (4,5) → itemIndex 3
    {
      popup: {
        text: () => <Trans i18nKey="tuto.observe-intro" components={C} />,
        position: { y: 30 }
      },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.DejaVuCard)
            .location((l) => l.type === LocationType.Grid && l.x === 3)
        ],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      }),
      move: {
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          move.location.type === LocationType.PlayerShowCard &&
          move.location.player === me &&
          move.itemIndex === 3
      }
    },

    // ─── 4. Expliquer ce qu'on voit (card45 = 4 et 5) ───────────────────────
    {
      popup: {
        text: () => <Trans i18nKey="tuto.observe-see" components={C} />,
        position: { x: -30, y: 5 }
      },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.DejaVuCard)
            .location((l) => l.type === LocationType.PlayerShowCard && l.player === me)
        ],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      }),
      move: {
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          (move.location.type === LocationType.Grid || move.location.type === LocationType.Deck)
      }
    },

    // ─── 5. Fin de tour avec jetons ──────────────────────────────────────────
    {
      popup: {
        text: () => <Trans i18nKey="tuto.end-of-turn" components={C} />,
        position: { x: 0, y: -15 }
      },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.InstinctToken)
            .location(LocationType.PlayerTokenPile).player(me)
        ],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      }),
      move: {
        filter: (move) => isCustomMoveType(CustomMoveType.EndTurn)(move)
      }
    },

    // ─── 6. Tour de l'adversaire ─────────────────────────────────────────────
    {
      popup: {
        text: () => <Trans i18nKey="tuto.opponent-turn" components={C} />
      }
    },

    // ─── 7. Adversaire retourne Grid[4] (card47: 4,7) — avec popup ───────────
    {
      popup: {
        text: () => <Trans i18nKey="tuto.alex-flip-first" components={C} />,
        position: { x: -25, y: 5 }
      },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.DejaVuCard)
            .location((l) => l.type === LocationType.Grid && l.x === 4)
        ],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      }),
      move: {
        player: opponent,
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          move.location.type === LocationType.Grid &&
          move.location.rotation === false &&
          move.itemIndex === 4
      }
    },

    // ─── 8. Adversaire retourne Grid[7] (card23: 2,3) → ÉCHEC automatique ───
    {
      popup: {
        text: () => <Trans i18nKey="tuto.fail-intro" components={C} />,
        position: { x: -25, y: -10 }
      },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.DejaVuCard)
            .location((l) => l.type === LocationType.Grid && (l.x === 4 || l.x === 7))
        ],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      }),
      move: {
        player: opponent,
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          move.location.type === LocationType.Grid &&
          move.location.rotation === false &&
          move.itemIndex === 7
      }
    },

    // ─── 9. Expliquer l'échec + attendre que l'adversaire finisse son tour ───
    {
      popup: {
        text: () => <Trans i18nKey="tuto.fail-result" components={C} />,
        position: { x: 30, y: 5 }
      },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.InstinctToken)
            .location(LocationType.PlayerTokenPile).player(me)
        ],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      }),
      move: {
        player: opponent,
        filter: (move) => isCustomMoveType(CustomMoveType.EndTurn)(move)
      }
    },

    // ─── 10. Mon tour : utiliser ma mémoire — retourner Grid[3] ──────────────
    {
      popup: {
        text: () => <Trans i18nKey="tuto.use-memory" components={C} />,
        position: { y: 30 }
      },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.DejaVuCard)
            .location((l) => l.type === LocationType.Grid && l.x === 3)
        ],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      }),
      move: {
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          move.location.type === LocationType.Grid &&
          move.location.rotation === false &&
          move.itemIndex === 3
      }
    },

    // ─── 11. Retourner Grid[0] (card15: 1,5) — partage le 5 ─────────────────
    {
      popup: {
        text: () => <Trans i18nKey="tuto.flip-more" components={C} />,
        position: { x: 30, y: 10 }
      },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.DejaVuCard)
            .location((l) => l.type === LocationType.Grid && (l.x === 0 || l.x === 1 || l.x === 3))
        ],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      }),
      move: {
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          move.location.type === LocationType.Grid &&
          move.location.rotation === false &&
          move.itemIndex === 0
      }
    },

    // ─── 12. Retourner Grid[1] (card25: 2,5) → TERMINE possible ─────────────
    {
      popup: {
        text: () => <Trans i18nKey="tuto.flip-one-more" components={C} />,
        position: { x: 30, y: 10 }
      },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.DejaVuCard)
            .location((l) => l.type === LocationType.Grid && (l.x === 0 || l.x === 1 || l.x === 3))
        ],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      }),
      move: {
        filter: (move) =>
          isMoveItemType(MaterialType.DejaVuCard)(move) &&
          move.location.type === LocationType.Grid &&
          move.location.rotation === false &&
          move.itemIndex === 1
      }
    },

    // ─── 13. Expliquer TERMINER ──────────────────────────────────────────────
    {
      popup: {
        text: () => <Trans i18nKey="tuto.terminate" components={C} />,
        position: { x: 30, y: 10 }
      },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.DejaVuCard)
            .location((l) => l.type === LocationType.Grid && l.rotation === false)
        ],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      }),
      move: {
        filter: (move) => isCustomMoveType(CustomMoveType.Terminate)(move)
      }
    },

    // ─── 14. Félicitations ───────────────────────────────────────────────────
    {
      popup: {
        text: () => <Trans i18nKey="tuto.terminate-result" components={C} />,
      },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.DejaVuCard)
            .location((l) => l.type === LocationType.PlayerPile && l.player === me)
        ],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      })
    },

    // ─── 15. Finir le tour (EndOfTurn) ───────────────────────────────────────
    {
      popup: {
        text: () => <Trans i18nKey="tuto.end-of-turn-2" components={C} />,
      },
      move: {
        filter: (move) => isCustomMoveType(CustomMoveType.EndTurn)(move)
      }
    },

    // ─── 16. Bonus instinct ──────────────────────────────────────────────────
    {
      popup: {
        text: () => <Trans i18nKey="tuto.bonus" components={C} />
      }
    },

    // ─── 17. Carte Fin ───────────────────────────────────────────────────────
    {
      popup: {
        text: () => <Trans i18nKey="tuto.end-card" components={C} />,
        position: { y: 30 }
      },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.DejaVuCard).location(LocationType.Deck)
        ],
        margin: { top: 2, bottom: 2, left: 2, right: 2 }
      })
    },

    // ─── 18. Score et victoire par instinct ──────────────────────────────────
    {
      popup: {
        text: () => <Trans i18nKey="tuto.scoring" components={C} />
      }
    },

    // ─── 19. Conclusion — pas de move: {} pour ne pas bloquer ────────────────
    {
      popup: {
        text: () => <Trans i18nKey="tuto.conclusion" components={C} />
      }
    }
  ]
}
