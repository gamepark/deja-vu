import { Locator } from '@gamepark/react-game'
import { Coordinates, Location } from '@gamepark/rules-api'

class DejaVuGridLocator extends Locator {
  getCoordinates(location: Location<number, number>): Partial<Coordinates> {
    switch (location.x) {
      case 0:
        return { x: -6.7, y: -9.2 }
      case 1:
        return { x: 0, y: -9.2 }
      case 2:
        return { x: 6.7, y: -9.2 }
      case 3:
        return { x: -6.7, y: 0 }
      case 4:
        return { x: 6.7, y: 0 }
      case 5:
        return { x: -6.7, y: 9.2 }
      case 6:
        return { x: 0, y: 9.2 }
      default:
        return { x: 6.7, y: 9.2 }
    }
  }
}

export const dejaVuGridLocator = new DejaVuGridLocator()
