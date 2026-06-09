import { DejaVuRules } from '@gamepark/deja-vu/DejaVuRules'
import { DejaVuCard, DejaVuCardId, dejaVuCardsData, endCard } from '@gamepark/deja-vu/material/DejaVuCard'
import { TERMINATE_MIN_OCCURRENCES } from '@gamepark/deja-vu/GameConstants'
import { LocationType } from '@gamepark/deja-vu/material/LocationType'
import { MaterialType } from '@gamepark/deja-vu/material/MaterialType'
import { Memory } from '@gamepark/deja-vu/Memory'
import { RevealedCards } from '@gamepark/deja-vu/rules/helper/RevealedCardsHelper'
import { CustomMoveType } from '@gamepark/deja-vu/rules/CustomMoveType'
import { RuleId } from '@gamepark/deja-vu/rules/RuleId'
import { isCustomMoveType, isMoveItemType, isMoveItemTypeAtOnce, MaterialGame, MaterialItem, MaterialMove, MoveItem } from '@gamepark/rules-api'
import { sample } from 'es-toolkit'

type CardMove = MoveItem<number, MaterialType, LocationType>

/**
 * Cautious, perfect-memory bot.
 *
 * The bot knows a card only if it has legitimately seen it:
 * - Revealed cards are public knowledge stored in the game state ({@link Memory.RevealedCards}),
 *   written by the rules whenever a card is flipped face up (by any player, even on a failure).
 * - Observed cards are private, so they are kept here, client-side, per player ({@link observedCards}).
 *   They cannot be stored in the game memory: it is broadcast to every player's view unfiltered, which
 *   would leak the identity of the face-down cards the bot peeked at.
 *
 * Behaviour:
 * - Never reveals a card it has not seen, and never reveals unless the whole sequence is guaranteed
 *   to succeed: it only starts revealing when it already knows a winning combo, then scores it.
 * - Never observes a card it already knows.
 * - At the end of the game, never takes the End card while another action is possible.
 * - Never spends an Instinct token to let the opponent replay.
 */

// itemIndex -> observed front, per player. Module-level so it survives across the stateless AI calls.
const observedCards = new Map<number, Map<number, DejaVuCard>>()
// Last seen total pile size (both players), per player. Pile size only grows within a game, so a drop
// means a new game (or an undo): we reset that bot's private observations.
const lastPileTotal = new Map<number, number>()

export const ai = (game: MaterialGame, player: number): Promise<MaterialMove[]> => {
  const rules = new DejaVuRules(game)
  updateObservations(game, player)

  const legalMoves = rules.getLegalMoves(player)
  if (legalMoves.length === 0) return Promise.resolve([])
  if (legalMoves.length === 1) return Promise.resolve(legalMoves)

  switch (game.rule?.id) {
    case RuleId.TakeAction:
      return Promise.resolve([getTakeActionMove(rules, game, player, legalMoves)])
    case RuleId.RevealCard:
      return Promise.resolve([getRevealCardMove(rules, game, player, legalMoves)])
    case RuleId.EndOfTurn:
      return Promise.resolve([getEndOfTurnMove(legalMoves)])
    default:
      return Promise.resolve([sample(legalMoves)!])
  }
}

// --- Memory -----------------------------------------------------------------

function getObserved(player: number): Map<number, DejaVuCard> {
  let memory = observedCards.get(player)
  if (!memory) {
    memory = new Map()
    observedCards.set(player, memory)
  }
  return memory
}

function updateObservations(game: MaterialGame, player: number): void {
  const items = game.items[MaterialType.DejaVuCard] ?? []
  const memory = getObserved(player)

  // Reset on new game / undo (pile size is monotonic within a game).
  const pileTotal = items.filter(item => item.location.type === LocationType.PlayerPile).length
  const previous = lastPileTotal.get(player)
  if (previous !== undefined && pileTotal < previous) memory.clear()
  lastPileTotal.set(player, pileTotal)

  // Record the card the bot is currently observing (face up in its own "show" slot).
  items.forEach((item, index) => {
    if (item.location.type !== LocationType.PlayerShowCard || item.location.player !== player) return
    const front = (item.id as DejaVuCardId | undefined)?.front
    if (front !== undefined) memory.set(index, front)
  })
}

// All cards the bot legitimately knows: public reveals (from the game state) plus its observations.
function knownCards(rules: DejaVuRules, player: number): Map<number, DejaVuCard> {
  const known = new Map<number, DejaVuCard>()
  const revealed = (rules.remind<RevealedCards>(Memory.RevealedCards) ?? {}) as RevealedCards
  for (const [index, front] of Object.entries(revealed)) known.set(Number(index), front)
  for (const [index, front] of getObserved(player)) known.set(index, front)
  return known
}

// --- Move selection ---------------------------------------------------------

function getTakeActionMove(rules: DejaVuRules, game: MaterialGame, player: number, moves: MaterialMove[]): MaterialMove {
  const memory = knownCards(rules, player)
  const flipMoves = moves.filter(isFlipMove)
  const observeMoves = moves.filter(isObserveMove)
  const takeEndMove = moves.find(isTakeEndMove)

  // Score now if a guaranteed winning combo is already known: start it by revealing one of its cards.
  const combo = bestKnownCombo(game, memory)
  if (combo) {
    const firstFlip = flipMoves.find(move => combo.has(move.itemIndex))
    if (firstFlip) return firstFlip
  }

  // Otherwise scout: observe a card the bot does not know yet (never re-observe a known card).
  const unknownObserves = observeMoves.filter(move => !memory.has(move.itemIndex))
  if (unknownObserves.length > 0) return sample(unknownObserves)!

  // No combo and nothing new to learn. Take the End card only if there is truly no other action.
  if (observeMoves.length === 0 && flipMoves.length === 0 && takeEndMove) return takeEndMove

  // Dead-end (everything known, no combo): waste the turn safely rather than reveal blindly.
  if (observeMoves.length > 0) return sample(observeMoves)!
  if (takeEndMove) return takeEndMove
  return sample(moves)!
}

function getRevealCardMove(rules: DejaVuRules, game: MaterialGame, player: number, moves: MaterialMove[]): MaterialMove {
  const memory = knownCards(rules, player)
  const terminate = moves.find(isMoveItemTypeAtOnce(MaterialType.DejaVuCard))
  const flipMoves = moves.filter(isFlipMove)

  const faceUpFronts = faceUpTableFronts(game)
  const common = intersectNumbers(faceUpFronts)

  // Pick the shared number whose combo (current + known matching face-down cards) is the largest.
  const target = chooseTargetNumber(faceUpFronts, common, flipMoves, memory)

  // Every known face-down card holding the target keeps the reveal valid and adds a card to the pile.
  if (target !== undefined) {
    const matchingFlips = flipMoves.filter(move =>
      memory.has(move.itemIndex) && dejaVuCardsData[memory.get(move.itemIndex)!].includes(target)
    )
    if (matchingFlips.length > 0) {
      // Prefer a card carrying the target twice (e.g. [n, n]) to grow occurrences faster.
      return matchingFlips.sort((a, b) =>
        occurrences(memory.get(b.itemIndex)!, target) - occurrences(memory.get(a.itemIndex)!, target)
      )[0]
    }
  }

  // No safe extension left: bank the points.
  if (terminate) return terminate

  // Should not happen (the bot only enters a reveal with a guaranteed combo); stay safe.
  return flipMoves.length > 0 ? sample(flipMoves)! : sample(moves)!
}

function getEndOfTurnMove(moves: MaterialMove[]): MaterialMove {
  // Never give a token to the opponent to let them replay.
  const endTurn = moves.find(isCustomMoveType(CustomMoveType.EndTurn))
  return endTurn ?? sample(moves)!
}

// --- Combo logic ------------------------------------------------------------

// Cards the bot could flip this turn: every Grid card + the top Deck card (unless it is the End card).
function revealableEntries(game: MaterialGame): { index: number; item: MaterialItem }[] {
  const items = game.items[MaterialType.DejaVuCard] ?? []
  const entries: { index: number; item: MaterialItem }[] = []

  let topDeckIndex = -1
  let topDeckX = -Infinity
  items.forEach((item, index) => {
    if (item.location.type === LocationType.Grid) {
      entries.push({ index, item })
    } else if (item.location.type === LocationType.Deck) {
      const x = item.location.x ?? 0
      if (x > topDeckX) {
        topDeckX = x
        topDeckIndex = index
      }
    }
  })

  if (topDeckIndex >= 0 && (items[topDeckIndex].id as DejaVuCardId).front !== endCard) {
    entries.push({ index: topDeckIndex, item: items[topDeckIndex] })
  }
  return entries
}

// Among the known, currently-flippable cards, find the best number reaching the terminate threshold.
// Returns the set of itemIndexes to collect, or undefined if no guaranteed combo exists.
function bestKnownCombo(game: MaterialGame, memory: Map<number, DejaVuCard>): Set<number> | undefined {
  const known = revealableEntries(game).filter(entry => memory.has(entry.index))
  let best: { occ: number; cards: number } | undefined
  let bestSet: Set<number> | undefined

  for (let n = 0; n <= 7; n++) {
    const cards = known.filter(entry => dejaVuCardsData[memory.get(entry.index)!].includes(n))
    if (cards.length === 0) continue
    const occ = cards.reduce((sum, entry) => sum + occurrences(memory.get(entry.index)!, n), 0)
    if (occ < TERMINATE_MIN_OCCURRENCES) continue
    if (!best || occ > best.occ || (occ === best.occ && cards.length > best.cards)) {
      best = { occ, cards: cards.length }
      bestSet = new Set(cards.map(entry => entry.index))
    }
  }
  return bestSet
}

function chooseTargetNumber(
  faceUpFronts: DejaVuCard[],
  common: number[],
  flipMoves: CardMove[],
  memory: Map<number, DejaVuCard>
): number | undefined {
  let target: number | undefined
  let bestPotential = -1
  for (const n of common) {
    const current = faceUpFronts.reduce((sum, front) => sum + occurrences(front, n), 0)
    const reachable = flipMoves.reduce((sum, move) =>
      memory.has(move.itemIndex) ? sum + occurrences(memory.get(move.itemIndex)!, n) : sum, 0)
    if (current + reachable > bestPotential) {
      bestPotential = current + reachable
      target = n
    }
  }
  return target
}

function faceUpTableFronts(game: MaterialGame): DejaVuCard[] {
  const items = game.items[MaterialType.DejaVuCard] ?? []
  return items
    .filter(item =>
      item.location.rotation === true &&
      (item.location.type === LocationType.Grid || item.location.type === LocationType.Deck))
    .map(item => (item.id as DejaVuCardId).front)
}

// --- Move predicates --------------------------------------------------------

const isFlipMove = (move: MaterialMove): move is CardMove =>
  isMoveItemType(MaterialType.DejaVuCard)(move) &&
  (move.location.type === LocationType.Grid || move.location.type === LocationType.Deck) &&
  move.location.rotation === true

const isObserveMove = (move: MaterialMove): move is CardMove =>
  isMoveItemType(MaterialType.DejaVuCard)(move) && move.location.type === LocationType.PlayerShowCard

const isTakeEndMove = (move: MaterialMove): move is CardMove =>
  isMoveItemType(MaterialType.DejaVuCard)(move) && move.location.type === LocationType.PlayerPile

// --- Number helpers ---------------------------------------------------------

function occurrences(card: DejaVuCard, n: number): number {
  return dejaVuCardsData[card].filter(value => value === n).length
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
