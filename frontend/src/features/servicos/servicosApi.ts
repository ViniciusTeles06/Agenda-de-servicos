import {
  ApiError,
  apiAtiva,
  esperar,
  lerArmazenado,
  montarQuery,
  normalizarTexto,
  paginar,
  requisicao,
  salvarArmazenado,
} from '../../lib/api'
import type { Pagina } from '../../lib/api'
import { formatarDuracao } from '../../lib/formatters'
import { registrarAtividade } from '../atividades/atividadesApi'
import type { FiltrosServico, Servico, ServicoEntrada } from './types'

const CHAVE = 'servicehub:servicos'
const usarApi = apiAtiva('servicos')

export const servicoPodeSerExcluido = !usarApi

interface ServicoApi {
  id: number
  nome: string
  descricao: string | null
  duracaoMinutos: number
  ativo: boolean
}

function daApi(servico: ServicoApi): Servico {
  return { ...servico, totalProfissionais: null }
}

function corpoDaApi(dados: ServicoEntrada) {
  return JSON.stringify({ nome: dados.nome, descricao: dados.descricao, duracaoMinutos: dados.duracaoMinutos })
}

async function alinharStatus(servico: ServicoApi, ativo: boolean) {
  if (servico.ativo === ativo) return servico
  return requisicao<ServicoApi>(`/api/servicos/${servico.id}/${ativo ? 'ativar' : 'desativar'}`, { method: 'PATCH' })
}

export const CHAVE_PROFISSIONAIS = 'servicehub:profissionais'

const iniciais: Servico[] = [
  { id: 1, nome: 'Corte de cabelo', descricao: 'Corte masculino ou feminino', duracaoMinutos: 30, ativo: true, totalProfissionais: 2 },
  { id: 2, nome: 'Barba', descricao: 'Aparar e modelar a barba', duracaoMinutos: 20, ativo: true, totalProfissionais: 2 },
  { id: 3, nome: 'Coloração', descricao: 'Coloração completa dos fios', duracaoMinutos: 90, ativo: true, totalProfissionais: 1 },
  { id: 4, nome: 'Manicure', descricao: 'Cuidado e esmaltação das unhas', duracaoMinutos: 45, ativo: true, totalProfissionais: 1 },
  { id: 5, nome: 'Massagem relaxante', descricao: 'Massagem corporal de relaxamento', duracaoMinutos: 60, ativo: true, totalProfissionais: 1 },
  { id: 6, nome: 'Escova modeladora', descricao: 'Escova com finalização e brilho', duracaoMinutos: 40, ativo: true, totalProfissionais: 0 },
  { id: 7, nome: 'Hidratação capilar', descricao: 'Tratamento de hidratação profunda', duracaoMinutos: 50, ativo: true, totalProfissionais: 0 },
  { id: 8, nome: 'Design de sobrancelha', descricao: 'Modelagem com pinça e linha', duracaoMinutos: 25, ativo: true, totalProfissionais: 0 },
  { id: 9, nome: 'Pedicure', descricao: 'Cuidado e esmaltação dos pés', duracaoMinutos: 50, ativo: false, totalProfissionais: 0 },
  { id: 10, nome: 'Limpeza de pele', descricao: null, duracaoMinutos: 75, ativo: false, totalProfissionais: 0 },
]

let servicos = lerArmazenado<Servico[]>(CHAVE, iniciais)

function contarProfissionais(servico: Servico) {
  const vinculos = lerArmazenado<{ servicoIds: number[] }[] | null>(CHAVE_PROFISSIONAIS, null)
  if (!vinculos) return servico.totalProfissionais ?? 0
  return vinculos.filter((item) => item.servicoIds.includes(servico.id)).length
}

function comContagem(servico: Servico): Servico {
  return { ...servico, totalProfissionais: contarProfissionais(servico) }
}

export function nomesDosServicos(ids: number[]) {
  return servicos
    .filter((item) => ids.includes(item.id))
    .map((item) => ({ id: item.id, nome: item.nome }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

export function servicosAtivos() {
  return servicos
    .filter((item) => item.ativo)
    .map((item) => ({ id: item.id, nome: item.nome }))
}

function salvar(lista: Servico[]) {
  servicos = lista
  salvarArmazenado(CHAVE, lista)
}

function buscarPorId(id: number) {
  const servico = servicos.find((item) => item.id === id)
  if (!servico) throw new ApiError(404, 'Serviço não encontrado.')
  return servico
}

function garantirNomeUnico(nome: string, ignorarId?: number) {
  const repetido = servicos.some((item) => item.id !== ignorarId && normalizarTexto(item.nome) === normalizarTexto(nome))
  if (repetido) throw new ApiError(409, 'Já existe um serviço com esse nome.')
}

export async function listarServicos(filtros: FiltrosServico): Promise<Pagina<Servico>> {
  if (usarApi) {
    const query = montarQuery({ ativo: filtros.status === 'todos' ? undefined : filtros.status === 'ativos' })
    const lista = await requisicao<ServicoApi[]>(`/api/servicos${query}`)
    const termo = normalizarTexto(filtros.busca)
    const filtrados = lista
      .filter((item) => !termo || normalizarTexto(`${item.nome} ${item.descricao ?? ''}`).includes(termo))
      .map(daApi)
    return paginar(filtrados, filtros.pagina, filtros.tamanho)
  }

  await esperar()
  const termo = normalizarTexto(filtros.busca)

  const filtrados = servicos
    .map(comContagem)
    .filter((item) => filtros.status === 'todos' || item.ativo === (filtros.status === 'ativos'))
    .filter((item) => !termo || normalizarTexto(`${item.nome} ${item.descricao ?? ''}`).includes(termo))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  return paginar(filtrados, filtros.pagina, filtros.tamanho)
}

export async function criarServico(dados: ServicoEntrada): Promise<Servico> {
  if (usarApi) {
    const criado = await requisicao<ServicoApi>('/api/servicos', { method: 'POST', body: corpoDaApi(dados) })
    return daApi(await alinharStatus(criado, dados.ativo))
  }

  await esperar(500)
  garantirNomeUnico(dados.nome)
  const id = Math.max(0, ...servicos.map((item) => item.id)) + 1
  const novo: Servico = { ...dados, id, totalProfissionais: 0 }
  salvar([...servicos, novo])
  registrarAtividade('servico', `Novo serviço ${novo.nome} cadastrado`)
  return novo
}

export async function atualizarServico(id: number, dados: ServicoEntrada): Promise<Servico> {
  if (usarApi) {
    const atualizado = await requisicao<ServicoApi>(`/api/servicos/${id}`, { method: 'PUT', body: corpoDaApi(dados) })
    return daApi(await alinharStatus(atualizado, dados.ativo))
  }

  await esperar(500)
  const atual = buscarPorId(id)
  garantirNomeUnico(dados.nome, id)
  const atualizado: Servico = { ...atual, ...dados }
  salvar(servicos.map((item) => (item.id === id ? atualizado : item)))
  registrarAtividade(
    'servico',
    atual.duracaoMinutos !== dados.duracaoMinutos
      ? `Serviço ${atualizado.nome} passou a durar ${formatarDuracao(dados.duracaoMinutos)}`
      : `Serviço ${atualizado.nome} foi atualizado`,
  )
  return comContagem(atualizado)
}

export async function alterarStatusServico(id: number, ativo: boolean): Promise<Servico> {
  if (usarApi) {
    const atualizado = await requisicao<ServicoApi>(`/api/servicos/${id}/${ativo ? 'ativar' : 'desativar'}`, { method: 'PATCH' })
    return daApi(atualizado)
  }

  await esperar(300)
  const atualizado: Servico = { ...buscarPorId(id), ativo }
  salvar(servicos.map((item) => (item.id === id ? atualizado : item)))
  registrarAtividade('servico', `Serviço ${atualizado.nome} foi ${ativo ? 'ativado' : 'desativado'}`)
  return comContagem(atualizado)
}

export async function excluirServico(id: number): Promise<void> {
  if (usarApi) {
    throw new ApiError(405, 'A API não permite excluir serviços. Desative o serviço para tirá-lo da agenda.')
  }

  await esperar(500)
  const servico = comContagem(buscarPorId(id))

  if ((servico.totalProfissionais ?? 0) > 0) {
    throw new ApiError(409, 'Esse serviço está vinculado a profissionais. Desative em vez de excluir.')
  }

  salvar(servicos.filter((item) => item.id !== id))
  registrarAtividade('servico', `Serviço ${servico.nome} foi excluído`)
}