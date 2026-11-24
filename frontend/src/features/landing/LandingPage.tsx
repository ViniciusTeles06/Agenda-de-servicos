import { Link } from 'react-router'
import Logo from '../../components/ui/Logo'

function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo size={72} />
      <h1 className="font-brand text-4xl font-medium text-brand sm:text-5xl">ServiceHub</h1>
      <p className="max-w-md text-muted">
        Gestão de serviços e agendamentos.
      </p>
      <Link
        to="/login"
        className="rounded-md bg-brand px-5 py-3 font-medium text-white transition-colors hover:bg-brand-hover"
      >
        Entrar
      </Link>
    </main>
  )
}

export default LandingPage