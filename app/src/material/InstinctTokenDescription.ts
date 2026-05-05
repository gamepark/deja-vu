import { TokenDescription } from '@gamepark/react-game'
import InstinctToken from '../images/InstinctToken.png'
import { InstinctTokenHelp } from './help/InstinctTokenHelp'

class InstinctTokenDescription extends TokenDescription {
  width = 4.94 / 2
  height = 9.4 / 2

  transparency = true

  image = InstinctToken
  help = InstinctTokenHelp
}

export const instinctTokenDescription = new InstinctTokenDescription()
