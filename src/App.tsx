import { useState } from 'react'
import { SplashScreen } from './SplashScreen'
import { Room } from './Room'
import './index.css'

function App() {
  const [isSplashFinished, setIsSplashFinished] = useState(false)

  const handleSplashFinish = () => {
    setIsSplashFinished(true)
  }

  return isSplashFinished ? <Room /> : <SplashScreen onFinished={handleSplashFinish} />
}

export default App
