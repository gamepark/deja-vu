import { DejaVuOptionsSpec } from '@gamepark/deja-vu/DejaVuOptions'
import { DejaVuRules } from '@gamepark/deja-vu/DejaVuRules'
import { DejaVuSetup } from '@gamepark/deja-vu/DejaVuSetup'
import { GameProvider } from '@gamepark/react-game'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { gameAnimations } from './animations/GameAnimations'
import { App } from './App'
import { Locators } from './locators/Locators'
import { Material } from './material/Material'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider
      game="deja-vu"
      Rules={DejaVuRules}
      optionsSpec={DejaVuOptionsSpec}
      GameSetup={DejaVuSetup}
      material={Material}
      locators={Locators}
      animations={gameAnimations}
    >
      <App />
    </GameProvider>
  </StrictMode>
)
