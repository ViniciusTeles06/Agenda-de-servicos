import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Mail, UserRound } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { ApiError } from '../../lib/api'
import { obterSessao, salvarSessao } from '../../lib/sessao'
import AuthLayout from './AuthLayout'
import AvisoErro from './AvisoErro'
import CampoSenha from './CampoSenha'
import { cadastrar } from './authApi'
import { SENHA_MINIMA, validarEmail } from './validacao'

interface Erros {
  nome?: string
  email?: string
  senha?: string
  confirmacao?: string
}

function CadastroPage() {
  const navigate = useNavigate()

  const [jaConectado] = useState(() => obterSessao() !== null)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erros, setErros] = useState<Erros>({})
  const [erroGeral, setErroGeral] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const [enviando, setEnviando] = useState(false)

  if (jaConectado) return <Navigate to="/app" replace />

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    const novos: Erros = {
      nome: nome.trim().length >= 3 ? undefined : 'Informe seu nome completo.',
      email: validarEmail(email),
      senha: senha.length >= SENHA_MINIMA ? undefined : `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`,
      confirmacao: confirmacao && confirmacao === senha ? undefined : 'As senhas não são iguais.',
    }

    setErros(novos)
    setErroGeral('')
    if (Object.values(novos).some(Boolean)) return

    setEnviando(true)

    try {
      const sessao = await cadastrar({ nome: nome.trim(), email: email.trim(), senha })
      salvarSessao(sessao)
      navigate('/app', { replace: true })
    } catch (erro) {
      setErroGeral(erro instanceof ApiError ? erro.message : 'Algo deu errado. Tente de novo.')
      setTentativa((atual) => atual + 1)
      setEnviando(false)
    }
  }

  return (
    <AuthLayout
      titulo="Criar conta"
      descricao="Comece a organizar seus serviços e horários."
      rodape={
        <>
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-brand hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={enviar} className="flex flex-col gap-5">
        {erroGeral && <AvisoErro mensagem={erroGeral} tentativa={tentativa} />}

        <Input
          label="Nome"
          autoComplete="name"
          placeholder="Seu nome completo"
          icon={<UserRound size={16} strokeWidth={1.6} />}
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          error={erros.nome}
          autoFocus
        />

        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@empresa.com"
          icon={<Mail size={16} strokeWidth={1.6} />}
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          error={erros.email}
        />

        <CampoSenha
          label="Senha"
          autoComplete="new-password"
          placeholder="Crie uma senha"
          value={senha}
          onChange={(evento) => setSenha(evento.target.value)}
          error={erros.senha}
          hint={erros.senha ? undefined : `Mínimo de ${SENHA_MINIMA} caracteres.`}
        />

        <CampoSenha
          label="Confirmar senha"
          autoComplete="new-password"
          placeholder="Repita a senha"
          value={confirmacao}
          onChange={(evento) => setConfirmacao(evento.target.value)}
          error={erros.confirmacao}
        />

        <Button
          type="submit"
          loading={enviando}
          icon={<ArrowRight size={16} strokeWidth={1.6} />}
          iconHover="nudge"
          className="mt-1 w-full flex-row-reverse"
        >
          {enviando ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default CadastroPage