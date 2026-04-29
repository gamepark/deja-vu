import { getRelativePlayerIndex, ListLocator, MaterialContext } from '@gamepark/react-game'
import { Coordinates, Location } from '@gamepark/rules-api'
import { instinctTokenDescription } from '../material/InstinctTokenDescription'

class PlayerTokenAreaLocator extends ListLocator {
  gap = { x: instinctTokenDescription.width + 0.5 }

  getCoordinates(location: Location, context: MaterialContext): Partial<Coordinates> {
    const index = getRelativePlayerIndex(context, location.player)
    return { x: -25, y: index === 0 ? 18 : -18 }
  }

  navigationSorts = []
}

export const playerTokenAreaLocator = new PlayerTokenAreaLocator()
