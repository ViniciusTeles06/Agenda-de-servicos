import { Outlet } from 'react-router'
import Topbar from './Topbar'

function AppLayout() {
  return (
    <div className="min-h-screen">
      <Topbar />

      <main className="px-4 py-8 sm:px-8 lg:px-12">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout