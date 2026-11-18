import { useCallback, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Navigate, Route, Routes } from 'react-router'
import SplashScreen from './components/SplashScreen'
import AppLayout from './components/layout/AppLayout'
import ComingSoonPage from './components/layout/ComingSoonPage'
import LandingPage from './features/landing/LandingPage'
import LoginPage from './features/auth/LoginPage'
import WorkspacePage from './features/workspace/WorkspacePage'
import { AgendamentosPage } from './features/agendamentos'
import { CalendarioPage } from './features/calendario'

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
          <Route path="agendamentos" element={<AgendamentosPage />} />
          <Route path="calendario" element={<CalendarioPage />} />
          <Route path="clientes" element={<ComingSoonPage title="Clientes" />} />
          <Route path="atividades" element={<ComingSoonPage title="Atividades" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App