import { useCallback, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Navigate, Route, Routes } from 'react-router'
import SplashScreen from './components/SplashScreen'
import AppLayout from './components/layout/AppLayout'
import LandingPage from './features/landing/LandingPage'
import { AgendamentosPage } from './features/agendamentos'
import AtividadesPage from './features/atividades/AtividadesPage'
import CadastroPage from './features/auth/CadastroPage'
import { CalendarioPage } from './features/calendario'
import LoginPage from './features/auth/LoginPage'
import ProfissionaisPage from './features/profissionais/ProfissionaisPage'
import ServicosPage from './features/servicos/ServicosPage'
import ConfiguracaoNegocioPage from './features/workspace/ConfiguracaoNegocioPage'
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
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<WorkspacePage />} />
          <Route path="agendamentos" element={<AgendamentosPage />} />
          <Route path="calendario" element={<CalendarioPage />} />
          <Route path="servicos" element={<ServicosPage />} />
          <Route path="profissionais" element={<ProfissionaisPage />} />
          <Route path="atividades" element={<AtividadesPage />} />
          <Route path="configuracoes-negocio" element={<ConfiguracaoNegocioPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App