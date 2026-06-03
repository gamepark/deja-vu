import { DejaVuSetup } from '@gamepark/deja-vu/DejaVuSetup'
import { cardBack, DejaVuCard } from '@gamepark/deja-vu/material/DejaVuCard'
import { LocationType } from '@gamepark/deja-vu/material/LocationType'
import { MaterialType } from '@gamepark/deja-vu/material/MaterialType'
import { RuleId } from '@gamepark/deja-vu/rules/RuleId'

export const me = 1
export const opponent = 2

// Grid layout (item indices 0–7):
// x=0: card24 (2,4) — joueur observe T1, révèle T3 (bonus)
// x=1: card44 (4,4) — joueur observe T2, révèle T3 (2×4)
// x=2: card34 (3,4) — Nico observe T1
// x=3: card35 (3,5) — Nico observe T2
// x=4: card45 (4,5) — joueur révèle T3 en premier
// x=5: card26 (2,6) — Nico révèle T3 en premier
// x=6: card07 (0,7) — Nico révèle T3 (échec)
// x=7: card57 (5,7) — filler
//
// Tour 3 joueur : card45(1×4) + card44(2×4) = 3× → peut Terminer
//                + card24(1×4) = 4× → Terminer avec bonus instinct
// Tour 3 Nico   : card26(2,6) + card07(0,7) → pas de chiffre commun → ÉCHEC
//
// item8: cardEnd (Deck x=0), items 9+: autres cartes du deck

export class TutorialSetup extends DejaVuSetup {
  setupMaterial() {
    const gridCards: [DejaVuCard, number][] = [
      [DejaVuCard.card24, 0],
      [DejaVuCard.card44, 1],
      [DejaVuCard.card34, 2],
      [DejaVuCard.card35, 3],
      [DejaVuCard.card45, 4],
      [DejaVuCard.card26, 5],
      [DejaVuCard.card07, 6],
      [DejaVuCard.card57, 7],
    ]
    for (const [card, x] of gridCards) {
      this.material(MaterialType.DejaVuCard).createItem({
        id: { front: card, back: cardBack(card) },
        location: { type: LocationType.Grid, x }
      })
    }

    // Deck — carte Fin tout en bas (x=0), les autres face cachée au-dessus
    this.material(MaterialType.DejaVuCard).createItem({
      id: { front: DejaVuCard.cardEnd, back: 0 },
      location: { type: LocationType.Deck, x: 0 }
    })
    const deckCards: DejaVuCard[] = [
      DejaVuCard.card02, DejaVuCard.card03, DejaVuCard.card04, DejaVuCard.card05, DejaVuCard.card06,
      DejaVuCard.card11, DejaVuCard.card12, DejaVuCard.card13, DejaVuCard.card14, DejaVuCard.card15,
      DejaVuCard.card16, DejaVuCard.card17, DejaVuCard.card22, DejaVuCard.card23, DejaVuCard.card25,
      DejaVuCard.card27, DejaVuCard.card33, DejaVuCard.card36, DejaVuCard.card37, DejaVuCard.card46,
      DejaVuCard.card47, DejaVuCard.card55, DejaVuCard.card56, DejaVuCard.card66,
    ]
    deckCards.forEach((card, i) => {
      this.material(MaterialType.DejaVuCard).createItem({
        id: { front: card, back: cardBack(card) },
        location: { type: LocationType.Deck, x: i + 1 }
      })
    })

    // Jetons : joueur 1 = 3, joueur 2 = 4
    this.material(MaterialType.InstinctToken).createItems([
      { quantity: 3, location: { type: LocationType.PlayerTokenPile, player: me } },
      { quantity: 4, location: { type: LocationType.PlayerTokenPile, player: opponent } }
    ])
  }

  start() {
    this.startPlayerTurn(RuleId.TakeAction, me)
  }
}
