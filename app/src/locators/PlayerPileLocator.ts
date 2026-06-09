import { DeckLocator, getRelativePlayerIndex, MaterialContext } from '@gamepark/react-game'
import { Coordinates, Location } from '@gamepark/rules-api'

class PlayerPileLocator extends DeckLocator {
  maxCount = 10

  getCoordinates(location: Location, context: MaterialContext): Partial<Coordinates> {
    const index = getRelativePlayerIndex(context, location.player)
    return { x: index === 0 ? -15 : 15, y: 0 }
  }

  navigationSorts = []
}

export const playerPileLocator = new PlayerPileLocator()
