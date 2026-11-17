export interface Pagina<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface CampoInvalido {
  campo: string
  mensagem: string
}

export class ApiError extends Error {
  status: number
  campos: CampoInvalido[]

  constructor(status: number, mensagem: string, campos: CampoInvalido[] = []) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
    this.campos = campos
  }
}

const BASE_URL = String(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export const usandoApiReal = BASE_URL !== ''

type ParametrosQuery = Record<string, string | number | boolean | undefined>

export function montarQuery(parametros: ParametrosQuery) {
  const busca = new URLSearchParams()

  for (const [chave, valor] of Object.entries(parametros)) {
    if (valor !== undefined && valor !== '') busca.set(chave, String(valor))
  }

  const texto = busca.toString()
  return texto ? `?${texto}` : ''
}

export async function requisicao<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  let resposta: Response

  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, {
      ...opcoes,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...opcoes.headers,
      },
    })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Confira se a API está rodando.')
  }

  if (resposta.status === 204) return undefined as T

  const corpo = await resposta.json().catch(() => null)

  if (!resposta.ok) {
    throw new ApiError(
      resposta.status,
      corpo?.mensagem ?? 'Algo deu errado. Tente de novo.',
      corpo?.campos ?? [],
    )
  }

  return corpo as T
}

export function esperar(ms = 350) {
  return new Promise((resolver) => window.setTimeout(resolver, ms))
}

export function paginar<T>(itens: T[], pagina: number, tamanho: number): Pagina<T> {
  const totalPages = Math.max(1, Math.ceil(itens.length / tamanho))
  const atual = Math.min(pagina, totalPages - 1)

  return {
    content: itens.slice(atual * tamanho, atual * tamanho + tamanho),
    totalElements: itens.length,
    totalPages,
    number: atual,
    size: tamanho,
  }
}

export function lerArmazenado<T>(chave: string, inicial: T): T {
  try {
    const texto = window.localStorage.getItem(chave)
    return texto ? (JSON.parse(texto) as T) : inicial
  } catch {
    return inicial
  }
}

export function salvarArmazenado(chave: string, valor: unknown) {
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor))
  } catch {
    return
  }
}

export function normalizarTexto(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}