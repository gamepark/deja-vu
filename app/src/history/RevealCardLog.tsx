import { MaterialLogProps, usePlayerName } from '@gamepark/react-game'
import { MoveItem } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'
import { DejaVuRules } from '@gamepark/deja-vu/DejaVuRules'
import { DejaVuCardId } from '@gamepark/deja-vu/material/DejaVuCard'
import { MaterialType } from '@gamepark/deja-vu/material/MaterialType'
import { DejaVuCardChip } from './DejaVuCardChip'

export const RevealCardLog = ({ move, context }: MaterialLogProps<MoveItem>) => {
  const player = usePlayerName(context.game.rule?.player)
  const item = new DejaVuRules(context.game).material(MaterialType.DejaVuCard).getItem<DejaVuCardId>(move.itemIndex)

  return (
    <Trans
      i18nKey="log.reveal"
      values={{ player }}
      components={{ card: item ? <DejaVuCardChip item={item} showFront /> : <span /> }}
    />
  )
}
