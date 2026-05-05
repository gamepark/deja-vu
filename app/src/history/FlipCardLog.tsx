import { MoveComponentProps, usePlayerName } from '@gamepark/react-game'
import { MaterialMove, MoveItem } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'
import { DejaVuRules } from '@gamepark/deja-vu/DejaVuRules'
import { MaterialType } from '@gamepark/deja-vu/material/MaterialType'
import { DejaVuCardChip } from './DejaVuCardChip'

export const FlipCardLog = ({ move, context }: MoveComponentProps<MaterialMove>) => {
  const player = usePlayerName(context.game.rule?.player)
  const moveItem = move as MoveItem
  const item = new DejaVuRules(context.game).material(MaterialType.DejaVuCard).getItem(moveItem.itemIndex)

  return (
    <Trans
      i18nKey="log.flip"
      values={{ player }}
      components={{ card: item ? <DejaVuCardChip item={item} /> : <span /> }}
    />
  )
}
