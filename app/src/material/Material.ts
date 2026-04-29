import { MaterialType } from '@gamepark/deja-vu/material/MaterialType'
import { MaterialDescription } from '@gamepark/react-game'
import { dejaVuCardDescription } from './DejaVuCardDescription'
import { instinctTokenDescription } from './InstinctTokenDescription'

export const Material: Partial<Record<MaterialType, MaterialDescription>> = {
  [MaterialType.DejaVuCard]: dejaVuCardDescription,
  [MaterialType.InstinctToken]: instinctTokenDescription
}
