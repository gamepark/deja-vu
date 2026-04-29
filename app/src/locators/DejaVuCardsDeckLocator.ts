import { DeckLocator } from '@gamepark/react-game'

export class DejaVuCardsDeckLocator extends DeckLocator {
  coordinates = { x: 0, y: 0 }
  gap = { x: 0, y: 0 }
}

export const dejaVuCardsDeckLocator = new DejaVuCardsDeckLocator()
