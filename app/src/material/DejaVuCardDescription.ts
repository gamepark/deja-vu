import { DejaVuCard } from '@gamepark/deja-vu/material/DejaVuCard.ts'
import { CardDescription } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import Front02 from "../images/cards/Front0-2.jpg"
import Front03 from "../images/cards/Front0-3.jpg"
import Front04 from "../images/cards/Front0-4.jpg"
import Front05 from "../images/cards/Front0-5.jpg"
import Front06 from "../images/cards/Front0-6.jpg"
import Front07 from "../images/cards/Front0-7.jpg"
import Front11 from "../images/cards/Front1-1.jpg"
import Front12 from "../images/cards/Front1-2.jpg"
import Front13 from "../images/cards/Front1-3.jpg"
import Front14 from "../images/cards/Front1-4.jpg"
import Front15 from "../images/cards/Front1-5.jpg"
import Front16 from "../images/cards/Front1-6.jpg"
import Front17 from "../images/cards/Front1-7.jpg"
import Front22 from "../images/cards/Front2-2.jpg"
import Front23 from "../images/cards/Front2-3.jpg"
import Front24 from "../images/cards/Front2-4.jpg"
import Front25 from "../images/cards/Front2-5.jpg"
import Front26 from "../images/cards/Front2-6.jpg"
import Front27 from "../images/cards/Front2-7.jpg"
import Front33 from "../images/cards/Front3-3.jpg"
import Front34 from "../images/cards/Front3-4.jpg"
import Front35 from "../images/cards/Front3-5.jpg"
import Front36 from "../images/cards/Front3-6.jpg"
import Front37 from "../images/cards/Front3-7.jpg"
import Front44 from "../images/cards/Front4-4.jpg"
import Front45 from "../images/cards/Front4-5.jpg"
import Front46 from "../images/cards/Front4-6.jpg"
import Front47 from "../images/cards/Front4-7.jpg"
import Front55 from "../images/cards/Front5-5.jpg"
import Front56 from "../images/cards/Front5-6.jpg"
import Front57 from "../images/cards/Front5-7.jpg"
import Front66 from "../images/cards/Front6-6.jpg"
import CardEnd from "../images/cards/CardEnd.jpg"
import Back02 from "../images/cards/Back02.jpg"
import Back03 from "../images/cards/Back03.jpg"
import Back04 from "../images/cards/Back04.jpg"
import Back05 from "../images/cards/Back05.jpg"
import Back06 from "../images/cards/Back06.jpg"
import Back07 from "../images/cards/Back07.jpg"
import Back08 from "../images/cards/Back08.jpg"
import Back09 from "../images/cards/Back09.jpg"
import Back10 from "../images/cards/Back10.jpg"
import Back11 from "../images/cards/Back11.jpg"
import Back12 from "../images/cards/Back12.jpg"

class DejaVuCardDescription extends CardDescription<number, number, number, DejaVuCard> {
  width = 6.3
  height = 8.8
  borderRadius = 0.3

  images= {
    [DejaVuCard.card02]: Front02,
    [DejaVuCard.card03]: Front03,
    [DejaVuCard.card04]: Front04,
    [DejaVuCard.card05]: Front05,
    [DejaVuCard.card06]: Front06,
    [DejaVuCard.card07]: Front07,
    [DejaVuCard.card11]: Front11,
    [DejaVuCard.card12]: Front12,
    [DejaVuCard.card13]: Front13,
    [DejaVuCard.card14]: Front14,
    [DejaVuCard.card15]: Front15,
    [DejaVuCard.card16]: Front16,
    [DejaVuCard.card17]: Front17,
    [DejaVuCard.card22]: Front22,
    [DejaVuCard.card23]: Front23,
    [DejaVuCard.card24]: Front24,
    [DejaVuCard.card25]: Front25,
    [DejaVuCard.card26]: Front26,
    [DejaVuCard.card27]: Front27,
    [DejaVuCard.card33]: Front33,
    [DejaVuCard.card34]: Front34,
    [DejaVuCard.card35]: Front35,
    [DejaVuCard.card36]: Front36,
    [DejaVuCard.card37]: Front37,
    [DejaVuCard.card44]: Front44,
    [DejaVuCard.card45]: Front45,
    [DejaVuCard.card46]: Front46,
    [DejaVuCard.card47]: Front47,
    [DejaVuCard.card55]: Front55,
    [DejaVuCard.card56]: Front56,
    [DejaVuCard.card57]: Front57,
    [DejaVuCard.card66]: Front66,
    [DejaVuCard.cardEnd]: CardEnd,
  }

  backImages= {
    [DejaVuCard.card02]: Back02,
    [DejaVuCard.card03]: Back03,
    [DejaVuCard.card04]: Back04,
    [DejaVuCard.card05]: Back05,
    [DejaVuCard.card06]: Back06,
    [DejaVuCard.card07]: Back07,
    [DejaVuCard.card11]: Back02,
    [DejaVuCard.card12]: Back03,
    [DejaVuCard.card13]: Back04,
    [DejaVuCard.card14]: Back05,
    [DejaVuCard.card15]: Back06,
    [DejaVuCard.card16]: Back07,
    [DejaVuCard.card17]: Back08,
    [DejaVuCard.card22]: Back04,
    [DejaVuCard.card23]: Back05,
    [DejaVuCard.card24]: Back06,
    [DejaVuCard.card25]: Back07,
    [DejaVuCard.card26]: Back08,
    [DejaVuCard.card27]: Back09,
    [DejaVuCard.card33]: Back06,
    [DejaVuCard.card34]: Back07,
    [DejaVuCard.card35]: Back08,
    [DejaVuCard.card36]: Back09,
    [DejaVuCard.card37]: Back10,
    [DejaVuCard.card44]: Back08,
    [DejaVuCard.card45]: Back09,
    [DejaVuCard.card46]: Back10,
    [DejaVuCard.card47]: Back11,
    [DejaVuCard.card55]: Back10,
    [DejaVuCard.card56]: Back11,
    [DejaVuCard.card57]: Back12,
    [DejaVuCard.card66]: Back12,
    [DejaVuCard.cardEnd]: CardEnd,
  }

  isFlipped = (item: Partial<MaterialItem>) => !!item.location?.rotation
}

export const dejaVuCardDescription = new DejaVuCardDescription()
