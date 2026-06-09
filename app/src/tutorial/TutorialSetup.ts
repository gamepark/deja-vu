import { DejaVuSetup } from '@gamepark/deja-vu/DejaVuSetup'
import { cardBack, DejaVuCard, dejaVuCards, endCard } from '@gamepark/deja-vu/material/DejaVuCard'
import { LocationType } from '@gamepark/deja-vu/material/LocationType'
import { MaterialType } from '@gamepark/deja-vu/material/MaterialType'
import { RuleId } from '@gamepark/deja-vu/rules/RuleId'
import { shuffle } from 'es-toolkit'

export const me = 1
export const opponent = 2

// Only the grid cards the tutorial's texts/logic depend on are scripted to fixed positions; every
// other card (grid filler x=7 and the whole deck) is drawn at random from the shuffled deck.
//   x=0 card24 (2,4) — joueur observe T1, révèle T3
//   x=1 card44 (4,4) — joueur observe T2, révèle T3
//   x=2 card34 (3,4) — Nico observe T1 (texte « carte 7 »)
//   x=3 card35 (3,5) — Nico observe T2 (texte « carte 8 »)
//   x=4 card45 (4,5) — joueur révèle T3 en premier
//   x=5 card26 (2,6) — Nico révèle T3 en premier
//   x=6 card07 (0,7) — Nico révèle T3 (échec : aucun chiffre commun avec card26)
// Tour 3 joueur : card45(1×4) + card44(2×4) + card24(1×4) = 4× le chiffre 4 → Terminer avec bonus.
//
// Item indices : 0–7 = grille (ordre de création = x), 8 = carte Fin, 9+ = deck.
// Les filtres `itemIndex` de Tutorial.tsx reposent sur cet ordre.
const scriptedGrid: Record<number, DejaVuCard> = {
  0: DejaVuCard.card24,
  1: DejaVuCard.card44,
  2: DejaVuCard.card34,
  3: DejaVuCard.card35,
  4: DejaVuCard.card45,
  5: DejaVuCard.card26,
  6: DejaVuCard.card07,
}

export class TutorialSetup extends DejaVuSetup {
  setupMaterial() {
    const scripted = Object.values(scriptedGrid)
    const pool = shuffle(dejaVuCards.filter(card => !scripted.includes(card)))

    // Grille : cartes scriptées à leur position, les emplacements restants complétés au hasard.
    for (let x = 0; x < 8; x++) {
      const card = scriptedGrid[x] ?? pool.pop()!
      this.material(MaterialType.DejaVuCard).createItem({
        id: { front: card, back: cardBack(card) },
        location: { type: LocationType.Grid, x }
      })
    }

    // Deck — carte Fin tout en bas (x=0), les autres cartes (aléatoires) face cachée au-dessus.
    this.material(MaterialType.DejaVuCard).createItem({
      id: { front: endCard, back: endCard },
      location: { type: LocationType.Deck, x: 0 }
    })
    pool.forEach((card, i) => {
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
