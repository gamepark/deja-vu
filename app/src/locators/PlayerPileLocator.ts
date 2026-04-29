import { DeckLocator, getRelativePlayerIndex, MaterialContext } from '@gamepark/react-game'
import { Coordinates, Location } from '@gamepark/rules-api'

class PlayerPileLocator extends DeckLocator {
  getCoordinates(location: Location, context: MaterialContext): Partial<Coordinates> {
    const index = getRelativePlayerIndex(context, location.player)
    return { x: 25, y: index === 0 ? 18 : -18 }
  }

  navigationSorts = []
}

export const playerPileLocator = new PlayerPileLocator()
