import { LocationType } from '@gamepark/deja-vu/material/LocationType'
import { MaterialType } from '@gamepark/deja-vu/material/MaterialType'
import { Locator } from '@gamepark/react-game'
import { dejaVuCardsDeckLocator } from './DejaVuCardsDeckLocator.ts'
import { dejaVuGridLocator } from './DejaVuGridLocator'
import { playerPileLocator } from './PlayerPileLocator'
import { playerShowCardLocator } from './PlayerShowCardLocator.ts'
import { playerTokenPileLocator } from './PlayerTokenPileLocator.ts'

export const Locators: Partial<Record<LocationType, Locator<number, MaterialType, LocationType>>> = {
  [LocationType.Deck]: dejaVuCardsDeckLocator,
  [LocationType.Grid]: dejaVuGridLocator,
  [LocationType.PlayerPile]: playerPileLocator,
  [LocationType.PlayerShowCard]: playerShowCardLocator,
  [LocationType.PlayerTokenPile]: playerTokenPileLocator
}
