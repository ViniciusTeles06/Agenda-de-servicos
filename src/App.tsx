import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import SplashScreen from './components/SplashScreen'
import Logo from './components/ui/Logo'

function App() {
  const [showSplash, setShowSplash] = useState(true)

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" onFinish={handleSplashFinish} />
        ) : (
          <motion.main
            key="home"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-ink"
          >
            <Logo size={64} />
            <h1 className="text-3xl font-semibold tracking-tight">ServiceHub</h1>
            <p className="text-muted">Página inicial em construção.</p>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App