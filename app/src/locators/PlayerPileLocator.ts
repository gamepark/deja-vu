import { DeckLocator, getRelativePlayerIndex, ItemContext, MaterialContext } from '@gamepark/react-game'
import { Coordinates, Location, MaterialItem } from '@gamepark/rules-api'
import { LocationType } from '@gamepark/deja-vu/material/LocationType'

class PlayerPileLocator extends DeckLocator {
  maxCount = 10

  getCoordinates(location: Location, context: MaterialContext): Partial<Coordinates> {
    const index = getRelativePlayerIndex(context, location.player)
    return { x: index === 0 ? -15 : 15, y: 0 }
  }

  getItemIndex(item: MaterialItem, context: ItemContext): number {
    return context.rules
      .material(context.type)
      .location(LocationType.PlayerPile)
      .player(item.location.player)
      .getIndexes()
      .indexOf(context.index)
  }

  navigationSorts = []
}

export const playerPileLocator = new PlayerPileLocator()
