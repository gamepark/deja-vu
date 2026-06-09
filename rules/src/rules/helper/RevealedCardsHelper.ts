import { MaterialRulesPart } from '@gamepark/rules-api'
import { Memory } from '../../Memory'
import { DejaVuCard, DejaVuCardId } from '../../material/DejaVuCard'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'

export type RevealedCards = Record<number, DejaVuCard>

export class RevealedCardsHelper extends MaterialRulesPart {
  // Record (publicly) every card currently face up on the table. Called whenever a card is revealed,
  // so a card seen during a failed attempt stays known after it flips back.
  rememberFaceUpCards(): void {
    const indexes = this.material(MaterialType.DejaVuCard)
      .location(location => location.type === LocationType.Grid || location.type === LocationType.Deck)
      .rotation(true)
      .getIndexes()
    if (!indexes.length) return

    this.memorize<RevealedCards>(Memory.RevealedCards, (known: RevealedCards = {}) => {
      const updated = { ...known }
      for (const index of indexes) {
        const front = this.material(MaterialType.DejaVuCard).getItem<DejaVuCardId>(index)?.id.front
        if (front !== undefined) updated[index] = front
      }
      return updated
    })
  }
}
