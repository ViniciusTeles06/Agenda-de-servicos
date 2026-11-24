import { Navigate, Outlet, useLocation } from 'react-router'
import { useSessao } from '../../lib/sessao'
import ToastProvider from '../ui/toast/ToastProvider'
import Topbar from './Topbar'

function AppLayout() {
  const sessao = useSessao()
  const location = useLocation()

  if (!sessao) return <Navigate to="/login" replace state={{ de: location.pathname }} />

  return (
    <ToastProvider>
      <div className="min-h-screen bg-page">
        <Topbar />

        <main className="px-4 pt-9 pb-12 sm:px-8 lg:px-12">
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  )
}

export default AppLayout