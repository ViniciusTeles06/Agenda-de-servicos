import { Link, Outlet } from 'react-router'

function AppLayout() {
  return (
    <div className="min-h-screen">
      <header className="flex h-16 items-center border-b border-line px-6">
        <Link to="/app" className="font-brand text-lg font-medium text-brand">
          ServiceHub
        </Link>
      </header>

      <main className="px-6 py-8 sm:px-12">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout