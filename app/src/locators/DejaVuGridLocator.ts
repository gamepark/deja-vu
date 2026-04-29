import { Locator } from '@gamepark/react-game'
import { Coordinates, Location } from '@gamepark/rules-api'

class DejaVuGridLocator extends Locator {
  getCoordinates(location: Location<number, number>): Partial<Coordinates> {
    switch (location.x) {
      case 0:
        return { x: -6.5, y: -9 }
      case 1:
        return { x: 0, y: -9 }
      case 2:
        return { x: 6.5, y: -9 }
      case 3:
        return { x: -6.5, y: 0 }
      case 4:
        return { x: 6.5, y: 0 }
      case 5:
        return { x: -6.5, y: 9 }
      case 6:
        return { x: 0, y: 9 }
      default:
        return { x: 6.5, y: 9 }
    }
  }
}

export const dejaVuGridLocator = new DejaVuGridLocator()
