import { MaterialLogProps, usePlayerName } from '@gamepark/react-game'
import { MoveItem } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'
import { DejaVuRules } from '@gamepark/deja-vu/DejaVuRules'
import { DejaVuCardId } from '@gamepark/deja-vu/material/DejaVuCard'
import { MaterialType } from '@gamepark/deja-vu/material/MaterialType'
import { DejaVuCardChip } from './DejaVuCardChip'
import { PositionIcon } from './PositionIcon'

export const ObserveCardLog = ({ move, context }: MaterialLogProps<MoveItem>) => {
  const player = usePlayerName(context.game.rule?.player)
  const item = new DejaVuRules(context.game).material(MaterialType.DejaVuCard).getItem<DejaVuCardId>(move.itemIndex)
  const gridX = move.location.id as number | undefined

  return (
    <Trans
      i18nKey="log.observe"
      values={{ player }}
      components={{
        card: item ? <DejaVuCardChip item={item} /> : <span />,
        pos: <PositionIcon x={gridX} />
      }}
    />
  )
}
