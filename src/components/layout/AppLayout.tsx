import { Outlet } from 'react-router'
import Topbar from './Topbar'

function AppLayout() {
  return (
    <div className="min-h-screen bg-page">
      <Topbar />

      <main className="px-4 pt-9 pb-12 sm:px-8 lg:px-12">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout