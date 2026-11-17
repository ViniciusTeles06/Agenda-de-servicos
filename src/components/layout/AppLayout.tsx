import { Outlet } from 'react-router'
import ToastProvider from '../ui/toast/ToastProvider'
import Topbar from './Topbar'

function AppLayout() {
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