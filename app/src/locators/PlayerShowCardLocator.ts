import { getRelativePlayerIndex, Locator, MaterialContext } from '@gamepark/react-game'
import { Coordinates, Location } from '@gamepark/rules-api'

class PlayerShowCardLocator extends Locator {
  getCoordinates(location: Location, context: MaterialContext): Partial<Coordinates> {
    const index = getRelativePlayerIndex(context, location.player)
    return { x: 15, y: index === 0 ? 18 : -18 }
  }
}

export const playerShowCardLocator = new PlayerShowCardLocator()
