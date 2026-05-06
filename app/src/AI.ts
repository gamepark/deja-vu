import { DejaVuRules } from '@gamepark/deja-vu/DejaVuRules'
import { LocationType } from '@gamepark/deja-vu/material/LocationType'
import { MaterialType } from '@gamepark/deja-vu/material/MaterialType'
import { CustomMoveType } from '@gamepark/deja-vu/rules/CustomMoveType'
import { RuleId } from '@gamepark/deja-vu/rules/RuleId'
import { isCustomMoveType, isMoveItemType, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { sample } from 'es-toolkit'

export const ai = (game: MaterialGame, player: number): Promise<MaterialMove[]> => {
  const rules = new DejaVuRules(game)
  const legalMoves = rules.getLegalMoves(player)

  if (legalMoves.length === 0) return Promise.resolve([])
  if (legalMoves.length === 1) return Promise.resolve(legalMoves)

  switch (game.rule?.id) {
    case RuleId.PlayCard:
      return Promise.resolve([getPlayCardMove(legalMoves)])
    case RuleId.RevealCard:
      return Promise.resolve([getRevealCardMove(legalMoves)])
    case RuleId.EndOfTurn:
      return Promise.resolve([getEndOfTurnMove(legalMoves)])
    default:
      return Promise.resolve([sample(legalMoves)!])
  }
}

function getPlayCardMove(moves: MaterialMove[]): MaterialMove {
  // Prefer flipping cards (rotation moves on grid/deck) over observing
  const flipMoves = moves.filter(m =>
    isMoveItemType(MaterialType.DejaVuCard)(m) &&
    (m.location.type === LocationType.Grid || m.location.type === LocationType.Deck) &&
    m.location.rotation === false
  )
  if (flipMoves.length > 0) return sample(flipMoves)!
  return sample(moves)!
}

function getRevealCardMove(moves: MaterialMove[]): MaterialMove {
  // Prefer Terminate (collect face-up cards = score points)
  const terminate = moves.find(isCustomMoveType(CustomMoveType.Terminate))
  if (terminate) return terminate
  return sample(moves)!
}

function getEndOfTurnMove(moves: MaterialMove[]): MaterialMove {
  // Never give a token to the opponent to let them replay
  const endTurn = moves.find(isCustomMoveType(CustomMoveType.EndTurn))
  if (endTurn) return endTurn
  return sample(moves)!
}
