import { CustomMove, isCustomMoveType, isMoveItemType, ItemMove, MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { Memory } from '../Memory'
import { DejaVuCardId, endCard } from '../material/DejaVuCard'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { CustomMoveType } from './CustomMoveType'
import { RuleId } from './RuleId'
import { EndGameHelper } from './helper/EndGameHelper'

export class EndOfTurnRule extends PlayerTurnRule {
  getPlayerMoves(): MaterialMove[] {
    const moves: MaterialMove[] = []

    const tokens = this.material(MaterialType.InstinctToken)
      .location(LocationType.PlayerTokenPile).player(this.player)

    // Give a token to the opponent to replay. Not allowed when:
    // - it is the player's last token (the opponent would reach the winning amount and win immediately), or
    // - replaying would be pointless because the only remaining action is taking the End card, which is
    //   forbidden after giving a token (taking the End card must be the only action of the turn).
    if (tokens.getQuantity() > 1 && this.hasPlayableCard) {
      moves.push(tokens.moveItem({ type: LocationType.PlayerTokenPile, player: this.nextPlayer }, 1))
    }

    moves.push(this.customMove(CustomMoveType.EndTurn))
    return moves
  }

  // A non-End card the player could observe or reveal on replay: a Grid card, or a non-End card on top of the Deck.
  private get hasPlayableCard(): boolean {
    if (this.material(MaterialType.DejaVuCard).location(LocationType.Grid).length > 0) return true
    const topDeckCard = this.material(MaterialType.DejaVuCard).location(LocationType.Deck).maxBy(item => item.location.x ?? 0)
    return topDeckCard.length > 0 && topDeckCard.getItem<DejaVuCardId>()?.id.front !== endCard
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    if (!isMoveItemType(MaterialType.InstinctToken)(move)) return []
    // A token was given to replay: taking the End card is no longer allowed for the rest of the turn.
    this.memorize(Memory.TokenGivenThisTurn, true)
    return [this.startRule(RuleId.TakeAction)]
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    if (isCustomMoveType(CustomMoveType.EndTurn)(move)) {
      return [new EndGameHelper(this.game).nextPlayerOrEnd(this.nextPlayer)]
    }
    return []
  }
}
