import { getEnumValues } from '@gamepark/rules-api'

export type DejaVuCardId = { front: DejaVuCard, back: number }

export enum DejaVuCard {
  card02 = 1,
  card03,
  card04,
  card05,
  card06,
  card07,
  card11,
  card12,
  card13,
  card14,
  card15,
  card16,
  card17,
  card22,
  card23,
  card24,
  card25,
  card26,
  card27,
  card33,
  card34,
  card35,
  card36,
  card37,
  card44,
  card45,
  card46,
  card47,
  card55,
  card56,
  card57,
  card66,
  cardEnd
}


export const dejaVuCards = getEnumValues(DejaVuCard).filter(card => card !== DejaVuCard.cardEnd)
export const endCard = DejaVuCard.cardEnd

export const dejaVuCardsData: Record<DejaVuCard, number[]> = {
  [DejaVuCard.card02]: [0, 2],
  [DejaVuCard.card03]: [0, 3],
  [DejaVuCard.card04]: [0, 4],
  [DejaVuCard.card05]: [0, 5],
  [DejaVuCard.card06]: [0, 6],
  [DejaVuCard.card07]: [0, 7],
  [DejaVuCard.card11]: [1, 1],
  [DejaVuCard.card12]: [1, 2],
  [DejaVuCard.card13]: [1, 3],
  [DejaVuCard.card14]: [1, 4],
  [DejaVuCard.card15]: [1, 5],
  [DejaVuCard.card16]: [1, 6],
  [DejaVuCard.card17]: [1, 7],
  [DejaVuCard.card22]: [2, 2],
  [DejaVuCard.card23]: [2, 3],
  [DejaVuCard.card24]: [2, 4],
  [DejaVuCard.card25]: [2, 5],
  [DejaVuCard.card26]: [2, 6],
  [DejaVuCard.card27]: [2, 7],
  [DejaVuCard.card33]: [3, 3],
  [DejaVuCard.card34]: [3, 4],
  [DejaVuCard.card35]: [3, 5],
  [DejaVuCard.card36]: [3, 6],
  [DejaVuCard.card37]: [3, 7],
  [DejaVuCard.card44]: [4, 4],
  [DejaVuCard.card45]: [4, 5],
  [DejaVuCard.card46]: [4, 6],
  [DejaVuCard.card47]: [4, 7],
  [DejaVuCard.card55]: [5, 5],
  [DejaVuCard.card56]: [5, 6],
  [DejaVuCard.card57]: [5, 7],
  [DejaVuCard.card66]: [6, 6],
  [DejaVuCard.cardEnd]: [0, 0],
}

export function cardBack(card: DejaVuCard): number {
  const [a, b] = dejaVuCardsData[card]
  return a + b
}