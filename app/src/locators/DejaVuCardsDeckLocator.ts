import { DeckLocator, ItemContext, MaterialContext } from '@gamepark/react-game'
import { Coordinates, Location, MaterialItem } from '@gamepark/rules-api'

// Valeur posée dans game.view par l'étape "tuto.end-card" (via le champ `view` du step). Tant qu'elle
// est active, la carte Fin (fond du paquet) est sortie sur la droite pour être dévoilée au joueur.
export const REVEAL_END_CARD_VIEW = 1

export class DejaVuCardsDeckLocator extends DeckLocator {
  coordinates = { x: 0, y: 0 }
  maxCount = 10

  // La carte Fin est créée en premier : elle est toujours au fond du paquet, à x = 0.
  private isEndCard(item: MaterialItem) {
    return item.location.x === 0
  }

  getItemCoordinates(item: MaterialItem, context: ItemContext): Partial<Coordinates> {
    const coordinates = super.getItemCoordinates(item, context)
    if (context.rules.game.view === REVEAL_END_CARD_VIEW && this.isEndCard(item)) {
      return { x: 6, y: -1, z: 0.01 }
    }
    return coordinates
  }

  // Sans ça, la carte Fin (index 0, au fond) est retirée du DOM par `limit` quand le paquet dépasse 20 cartes.
  hide(item: MaterialItem, context: ItemContext): boolean {
    if (context.rules.game.view === REVEAL_END_CARD_VIEW && this.isEndCard(item)) {
      return false
    }
    return super.hide(item, context)
  }

  getPositionDependencies(location: Location, context: MaterialContext): unknown {
    return [super.getPositionDependencies(location, context), context.rules.game.view]
  }
}

export const dejaVuCardsDeckLocator = new DejaVuCardsDeckLocator()
