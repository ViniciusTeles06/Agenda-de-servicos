import {
  ApiError,
  esperar,
  lerArmazenado,
  montarQuery,
  normalizarTexto,
  paginar,
  requisicao,
  salvarArmazenado,
  usandoApiReal,
} from '../../lib/api'
import type { Pagina } from '../../lib/api'
import { CHAVE_PROFISSIONAIS, nomesDosServicos } from '../servicos/servicosApi'
import type { FiltrosProfissional, Profissional, ProfissionalEntrada } from './types'

interface ProfissionalSalvo {
  id: number
  nome: string
  email: string
  telefone: string | null
  ativo: boolean
  servicoIds: number[]
}

const iniciais: ProfissionalSalvo[] = [
  { id: 1, nome: 'Ana Souza', email: 'ana.souza@exemplo.com', telefone: '82999990001', ativo: true, servicoIds: [1, 3] },
  { id: 2, nome: 'Bruno Lima', email: 'bruno.lima@exemplo.com', telefone: '82999990002', ativo: true, servicoIds: [1, 2] },
  { id: 3, nome: 'Carla Mendes', email: 'carla.mendes@exemplo.com', telefone: '82999990003', ativo: true, servicoIds: [4, 5] },
  { id: 4, nome: 'Diego Santos', email: 'diego.santos@exemplo.com', telefone: '82999990004', ativo: false, servicoIds: [2] },
]

let profissionais = lerArmazenado<ProfissionalSalvo[]>(CHAVE_PROFISSIONAIS, iniciais)
salvarArmazenado(CHAVE_PROFISSIONAIS, profissionais)

function salvar(lista: ProfissionalSalvo[]) {
  profissionais = lista
  salvarArmazenado(CHAVE_PROFISSIONAIS, lista)
}

function paraResposta(item: ProfissionalSalvo): Profissional {
  const { servicoIds, ...resto } = item
  return { ...resto, servicos: nomesDosServicos(servicoIds) }
}

function buscarPorId(id: number) {
  const profissional = profissionais.find((item) => item.id === id)
  if (!profissional) throw new ApiError(404, 'Profissional não encontrado.')
  return profissional
}

function garantirEmailUnico(email: string, ignorarId?: number) {
  const repetido = profissionais.some((item) => item.id !== ignorarId && item.email.toLowerCase() === email.toLowerCase())
  if (repetido) throw new ApiError(409, 'Já existe um profissional com esse e-mail.')
}

export async function listarProfissionais(filtros: FiltrosProfissional): Promise<Pagina<Profissional>> {
  if (usandoApiReal) {
    const query = montarQuery({
      busca: filtros.busca,
      ativo: filtros.status === 'todos' ? undefined : filtros.status === 'ativos',
      page: filtros.pagina,
      size: filtros.tamanho,
      sort: 'nome,asc',
    })
    return requisicao(`/api/profissionais${query}`)
  }

  await esperar()
  const termo = normalizarTexto(filtros.busca)

  const filtrados = profissionais
    .map(paraResposta)
    .filter((item) => filtros.status === 'todos' || item.ativo === (filtros.status === 'ativos'))
    .filter((item) => {
      if (!termo) return true
      const texto = `${item.nome} ${item.email} ${item.servicos.map((servico) => servico.nome).join(' ')}`
      return normalizarTexto(texto).includes(termo)
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  return paginar(filtrados, filtros.pagina, filtros.tamanho)
}

export async function criarProfissional(dados: ProfissionalEntrada): Promise<Profissional> {
  if (usandoApiReal) {
    return requisicao('/api/profissionais', { method: 'POST', body: JSON.stringify(dados) })
  }

  await esperar(500)
  garantirEmailUnico(dados.email)
  const id = Math.max(0, ...profissionais.map((item) => item.id)) + 1
  const novo: ProfissionalSalvo = { ...dados, id }
  salvar([...profissionais, novo])
  return paraResposta(novo)
}

export async function atualizarProfissional(id: number, dados: ProfissionalEntrada): Promise<Profissional> {
  if (usandoApiReal) {
    return requisicao(`/api/profissionais/${id}`, { method: 'PUT', body: JSON.stringify(dados) })
  }

  await esperar(500)
  buscarPorId(id)
  garantirEmailUnico(dados.email, id)
  const atualizado: ProfissionalSalvo = { ...dados, id }
  salvar(profissionais.map((item) => (item.id === id ? atualizado : item)))
  return paraResposta(atualizado)
}

export async function alterarStatusProfissional(id: number, ativo: boolean): Promise<Profissional> {
  if (usandoApiReal) {
    return requisicao(`/api/profissionais/${id}/${ativo ? 'ativar' : 'desativar'}`, { method: 'PATCH' })
  }

  await esperar(300)
  const atualizado: ProfissionalSalvo = { ...buscarPorId(id), ativo }
  salvar(profissionais.map((item) => (item.id === id ? atualizado : item)))
  return paraResposta(atualizado)
}

export async function excluirProfissional(id: number): Promise<void> {
  if (usandoApiReal) {
    return requisicao(`/api/profissionais/${id}`, { method: 'DELETE' })
  }

  await esperar(500)
  buscarPorId(id)
  salvar(profissionais.filter((item) => item.id !== id))
}