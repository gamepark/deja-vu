import { DejaVuSetup } from '@gamepark/deja-vu/DejaVuSetup'
import { cardBack, DejaVuCard } from '@gamepark/deja-vu/material/DejaVuCard'
import { LocationType } from '@gamepark/deja-vu/material/LocationType'
import { MaterialType } from '@gamepark/deja-vu/material/MaterialType'
import { RuleId } from '@gamepark/deja-vu/rules/RuleId'

export const me = 1
export const opponent = 2

// Fixed grid layout:
// Grid[0]: card15 (1,5)  Grid[1]: card25 (2,5)  Grid[2]: card35 (3,5)
// Grid[3]: card45 (4,5)  — observée au tour 1
// Grid[4]: card47 (4,7)  Grid[5]: card57 (5,7)  Grid[6]: card37 (3,7)
// Grid[7]: card23 (2,3)  — ne partage aucun chiffre avec card47 → échec
//
// Item indices (création dans l'ordre):
// 0: card15, 1: card25, 2: card35, 3: card45, 4: card47,
// 5: card57, 6: card37, 7: card23
// 8: cardEnd (Deck x=0), 9..N: autres cartes du deck

export class TutorialSetup extends DejaVuSetup {
  setupMaterial() {
    // Grid — toutes face cachée
    const gridCards: [DejaVuCard, number][] = [
      [DejaVuCard.card15, 0],
      [DejaVuCard.card25, 1],
      [DejaVuCard.card35, 2],
      [DejaVuCard.card45, 3],
      [DejaVuCard.card47, 4],
      [DejaVuCard.card57, 5],
      [DejaVuCard.card37, 6],
      [DejaVuCard.card23, 7],
    ]
    for (const [card, x] of gridCards) {
      this.material(MaterialType.DejaVuCard).createItem({ id: { front: card, back: cardBack(card) }, location: { type: LocationType.Grid, x } })
    }

    // Deck — carte Fin tout en bas (x=0), les autres cartes face cachée au-dessus
    this.material(MaterialType.DejaVuCard).createItem({
      id: { front: DejaVuCard.cardEnd, back: 0 },
      location: { type: LocationType.Deck, x: 0 }
    })
    const deckCards: DejaVuCard[] = [
      DejaVuCard.card02, DejaVuCard.card03, DejaVuCard.card04, DejaVuCard.card05, DejaVuCard.card06,
      DejaVuCard.card07, DejaVuCard.card11, DejaVuCard.card12, DejaVuCard.card13, DejaVuCard.card14,
      DejaVuCard.card16, DejaVuCard.card17, DejaVuCard.card22, DejaVuCard.card24, DejaVuCard.card26,
      DejaVuCard.card27, DejaVuCard.card33, DejaVuCard.card34, DejaVuCard.card36, DejaVuCard.card44,
      DejaVuCard.card46, DejaVuCard.card55, DejaVuCard.card56, DejaVuCard.card66,
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
