import { TokenDescription } from '@gamepark/react-game'
import InstinctToken from '../images/InstinctToken.png'

class InstinctTokenDescription extends TokenDescription {
  width = 4.94 / 2
  height = 9.4 / 2

  image = InstinctToken
}

export const instinctTokenDescription = new InstinctTokenDescription()
