import { Link } from 'react-router'
import Logo from '../../components/ui/Logo'

function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo size={56} />
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Entrar</h1>
      <p className="text-muted">A tela de login vai ser construída aqui.</p>
      <div className="flex gap-3">
        <Link
          to="/"
          className="rounded-md border border-line px-5 py-3 font-medium text-ink transition-colors hover:bg-surface-soft"
        >
          Voltar
        </Link>
        <Link
          to="/app"
          className="rounded-md bg-brand px-5 py-3 font-medium text-white transition-colors hover:bg-brand-hover"
        >
          Ir para o painel
        </Link>
      </div>
    </main>
  )
}

export default LoginPage