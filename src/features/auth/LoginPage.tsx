import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Mail } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { ApiError } from '../../lib/api'
import { obterSessao, salvarSessao } from '../../lib/sessao'
import AuthLayout from './AuthLayout'
import AvisoErro from './AvisoErro'
import CampoSenha from './CampoSenha'
import { entrar } from './authApi'
import { validarEmail } from './validacao'

interface Erros {
  email?: string
  senha?: string
}

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const destino = (location.state as { de?: string } | null)?.de ?? '/app'

  const [jaConectado] = useState(() => obterSessao() !== null)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erros, setErros] = useState<Erros>({})
  const [erroGeral, setErroGeral] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const [enviando, setEnviando] = useState(false)

  if (jaConectado) return <Navigate to="/app" replace />

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    const novos: Erros = {
      email: validarEmail(email),
      senha: senha ? undefined : 'Informe sua senha.',
    }

    setErros(novos)
    setErroGeral('')
    if (novos.email || novos.senha) return

    setEnviando(true)

    try {
      const sessao = await entrar({ email: email.trim(), senha })
      salvarSessao(sessao)
      navigate(destino, { replace: true })
    } catch (erro) {
      setErroGeral(erro instanceof ApiError ? erro.message : 'Algo deu errado. Tente de novo.')
      setTentativa((atual) => atual + 1)
      setEnviando(false)
    }
  }

  return (
    <AuthLayout
      titulo="Entrar"
      descricao="Acesse sua agenda de serviços."
      rodape={
        <>
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="font-medium text-brand hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={enviar} className="flex flex-col gap-5">
        {erroGeral && <AvisoErro mensagem={erroGeral} tentativa={tentativa} />}

        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@empresa.com"
          icon={<Mail size={16} strokeWidth={1.6} />}
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          error={erros.email}
          autoFocus
        />

        <CampoSenha
          label="Senha"
          autoComplete="current-password"
          placeholder="Sua senha"
          value={senha}
          onChange={(evento) => setSenha(evento.target.value)}
          error={erros.senha}
        />

        <Button
          type="submit"
          loading={enviando}
          icon={<ArrowRight size={16} strokeWidth={1.6} />}
          iconHover="nudge"
          className="mt-1 w-full flex-row-reverse"
        >
          {enviando ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default LoginPage