export enum Memory {
  // True once the player has given a token to replay during the current turn.
  // While set, taking the End card is forbidden (it must be the only action of the turn).
  TokenGivenThisTurn = 1
}
