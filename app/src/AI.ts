import { DejaVuRules } from '@gamepark/deja-vu/DejaVuRules'
import { DejaVuCard, DejaVuCardId, dejaVuCardsData } from '@gamepark/deja-vu/material/DejaVuCard'
import { LocationType } from '@gamepark/deja-vu/material/LocationType'
import { MaterialType } from '@gamepark/deja-vu/material/MaterialType'
import { CustomMoveType } from '@gamepark/deja-vu/rules/CustomMoveType'
import { RuleId } from '@gamepark/deja-vu/rules/RuleId'
import { isCustomMoveType, isMoveItemType, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { sample } from 'es-toolkit'

// Probability of observing a card instead of flipping it
const OBSERVE_PROBABILITY = 0.5
// Probability of flipping a wrong card (forgetting the right one)
const MISTAKE_PROBABILITY = 0.35

export const ai = (game: MaterialGame, player: number): Promise<MaterialMove[]> => {
  const rules = new DejaVuRules(game)
  const legalMoves = rules.getLegalMoves(player)

  if (legalMoves.length === 0) return Promise.resolve([])
  if (legalMoves.length === 1) return Promise.resolve(legalMoves)

  switch (game.rule?.id) {
    case RuleId.TakeAction:
      return Promise.resolve([getPlayCardMove(legalMoves)])
    case RuleId.RevealCard:
      return Promise.resolve([getRevealCardMove(game, legalMoves)])
    case RuleId.EndOfTurn:
      return Promise.resolve([getEndOfTurnMove(legalMoves)])
    default:
      return Promise.resolve([sample(legalMoves)!])
  }
}

function getPlayCardMove(moves: MaterialMove[]): MaterialMove {
  const takeEndCardMove = moves.find(m =>
    isMoveItemType(MaterialType.DejaVuCard)(m) &&
    m.location.type === LocationType.PlayerPile
  )
  if (takeEndCardMove) return takeEndCardMove

  const flipMoves = moves.filter(m =>
    isMoveItemType(MaterialType.DejaVuCard)(m) &&
    (m.location.type === LocationType.Grid || m.location.type === LocationType.Deck) &&
    m.location.rotation === true
  )
  const observeMoves = moves.filter(m =>
    isMoveItemType(MaterialType.DejaVuCard)(m) &&
    m.location.type === LocationType.PlayerShowCard
  )

  // Sometimes observe a card instead of flipping (simulates hesitation / memory check)
  if (observeMoves.length > 0 && Math.random() < OBSERVE_PROBABILITY) {
    return sample(observeMoves)!
  }

  if (flipMoves.length > 0) return sample(flipMoves)!
  return sample(moves)!
}

function getRevealCardMove(game: MaterialGame, moves: MaterialMove[]): MaterialMove {
  // Terminate as soon as possible (collect face-up cards = score points)
  const terminate = moves.find(isCustomMoveType(CustomMoveType.Terminate))
  if (terminate) return terminate

  const allCards = game.items[MaterialType.DejaVuCard] ?? []
  const faceUpCards = allCards.filter(item =>
    (item.location.type === LocationType.Grid || item.location.type === LocationType.Deck) &&
    item.location.rotation === true
  )

  const flipMoves = moves.filter(m => isMoveItemType(MaterialType.DejaVuCard)(m))

  if (faceUpCards.length === 0) return sample(flipMoves)!

  const commonNumbers = intersectNumbers(faceUpCards.map(item => (item.id as DejaVuCardId).front))
  if (commonNumbers.length === 0) return sample(flipMoves)!

  // Sometimes make a mistake and flip a non-matching card (simulates forgetting)
  if (Math.random() < MISTAKE_PROBABILITY) return sample(flipMoves)!

  // Only flip cards that share a number with the already-revealed cards
  const matchingMoves = flipMoves.filter(m => {
    if (!isMoveItemType(MaterialType.DejaVuCard)(m)) return false
    const card = allCards[m.itemIndex]
    if (!card?.id) return false
    return dejaVuCardsData[(card.id as DejaVuCardId).front].some(n => commonNumbers.includes(n))
  })

  return matchingMoves.length > 0 ? sample(matchingMoves)! : sample(flipMoves)!
}

function getEndOfTurnMove(moves: MaterialMove[]): MaterialMove {
  // Never give a token to the opponent to let them replay
  const endTurn = moves.find(isCustomMoveType(CustomMoveType.EndTurn))
  if (endTurn) return endTurn
  return sample(moves)!
}

function intersectNumbers(cardIds: DejaVuCard[]): number[] {
  if (cardIds.length === 0) return []
  let common = [...dejaVuCardsData[cardIds[0]]]
  for (const id of cardIds.slice(1)) {
    common = common.filter(n => dejaVuCardsData[id].includes(n))
    if (common.length === 0) return []
  }
  return common
}
