import { getRelativePlayerIndex, MaterialContext, PileLocator } from '@gamepark/react-game'
import { Coordinates, Location } from '@gamepark/rules-api'

class PlayerTokenPileLocator extends PileLocator {

  getCoordinates(location: Location, context: MaterialContext): Partial<Coordinates> {
    const index = getRelativePlayerIndex(context, location.player)
    return { x: index === 0 ? -15 : 15, y: -9 }
  }

  navigationSorts = []
}

export const playerTokenPileLocator = new PlayerTokenPileLocator()
