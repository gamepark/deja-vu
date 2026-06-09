export enum Memory {
  // True once the player has given a token to replay during the current turn.
  // While set, taking the End card is forbidden (it must be the only action of the turn).
  TokenGivenThisTurn = 1,
  // Public record of every card revealed on the table (Grid/Deck, face up), as itemIndex -> front.
  // Both players have seen these, so it is shared knowledge that survives across turns (including
  // cards seen during a failed attempt, before they flip back face-down).
  RevealedCards
}
