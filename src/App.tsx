import { useCallback, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Navigate, Route, Routes } from 'react-router'
import SplashScreen from './components/SplashScreen'
import AppLayout from './components/layout/AppLayout'
import ComingSoonPage from './components/layout/ComingSoonPage'
import LandingPage from './features/landing/LandingPage'
import LoginPage from './features/auth/LoginPage'
import ServicosPage from './features/servicos/ServicosPage'
import WorkspacePage from './features/workspace/WorkspacePage'

function App() {
  const [showSplash, setShowSplash] = useState(true)

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false)
  }, [])

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" onFinish={handleSplashFinish} />}
      </AnimatePresence>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<WorkspacePage />} />
          <Route path="servicos" element={<ServicosPage />} />
          <Route path="profissionais" element={<ComingSoonPage title="Profissionais" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App