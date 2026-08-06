import { DejaVuOptionsSpecV2 } from '@gamepark/deja-vu/DejaVuOptions'
import { DejaVuRules } from '@gamepark/deja-vu/DejaVuRules'
import { DejaVuSetup } from '@gamepark/deja-vu/DejaVuSetup'
import { GameProvider } from '@gamepark/react-game'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { gameAnimations } from './animations/GameAnimations'
import { App } from './App'
import { Locators } from './locators/Locators'
import { Material } from './material/Material'
import { scoring } from './Scoring'
import { DejaVuLogs } from './history/DejaVuLogs'
import { theme } from './theme'
import { ai } from './AI'
import { Tutorial } from './tutorial/Tutorial'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider
      game="deja-vu"
      Rules={DejaVuRules}
      optionsSpec={DejaVuOptionsSpecV2}
      GameSetup={DejaVuSetup}
      material={Material}
      locators={Locators}
      animations={gameAnimations}
      scoring={scoring}
      logs={new DejaVuLogs()}
      theme={theme}
      ai={ai}
      tutorial={new Tutorial()}
    >
      <App />
    </GameProvider>
  </StrictMode>
)
