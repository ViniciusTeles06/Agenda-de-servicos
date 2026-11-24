import { apiAtiva, esperar, requisicao } from '../../lib/api'
import type { Sessao, Usuario } from '../../lib/sessao'

export interface DadosLogin {
  email: string
  senha: string
}

export interface DadosCadastro {
  nome: string
  email: string
  senha: string
}

interface RespostaAuth {
  accessToken: string
  tokenType: string
  expiresInSeconds: number
  usuario: Usuario
}

export const ROTAS_AUTH = {
  login: '/api/auth/login',
  cadastro: '/api/auth/cadastro',
}

function paraSessao(resposta: RespostaAuth): Sessao {
  return { token: resposta.accessToken, usuario: resposta.usuario }
}

function nomePeloEmail(email: string) {
  const nome = email
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((parte) => parte[0].toUpperCase() + parte.slice(1))
    .join(' ')

  return nome || 'Usuário'
}

export async function entrar(dados: DadosLogin): Promise<Sessao> {
  if (apiAtiva('auth')) {
    const resposta = await requisicao<RespostaAuth>(ROTAS_AUTH.login, { method: 'POST', body: JSON.stringify(dados) })
    return paraSessao(resposta)
  }

  await esperar(700)
  const email = dados.email.trim().toLowerCase()
  return { token: 'demonstracao', usuario: { id: 1, nome: nomePeloEmail(email), email } }
}

export async function cadastrar(dados: DadosCadastro): Promise<Sessao> {
  if (apiAtiva('auth')) {
    const resposta = await requisicao<RespostaAuth>(ROTAS_AUTH.cadastro, { method: 'POST', body: JSON.stringify(dados) })
    return paraSessao(resposta)
  }

  await esperar(800)
  return {
    token: 'demonstracao',
    usuario: { id: 1, nome: dados.nome.trim(), email: dados.email.trim().toLowerCase() },
  }
}