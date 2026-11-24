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
import { registrarAtividade } from '../atividades/atividadesApi'
import { CHAVE_PROFISSIONAIS, nomesDosServicos } from '../servicos/servicosApi'
import { normalizarHora, ordenarIntervalos } from './horarios'
import type { Disponibilidade, FiltrosProfissional, Profissional, ProfissionalEntrada } from './types'

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

const CHAVE_DISPONIBILIDADES = 'servicehub:disponibilidades'

function expediente(dias: number[], faixas: [string, string][]) {
  return dias.flatMap((diaSemana) => faixas.map(([horaInicio, horaFim]) => ({ diaSemana, horaInicio, horaFim })))
}

const diasUteis = [1, 2, 3, 4, 5]
const manhaETarde: [string, string][] = [
  ['08:00', '12:00'],
  ['14:00', '18:00'],
]

const disponibilidadesIniciais: Record<number, Disponibilidade[]> = {
  1: expediente(diasUteis, manhaETarde),
  2: expediente(diasUteis, manhaETarde),
  3: expediente(diasUteis, manhaETarde),
  4: expediente([6], [['08:00', '14:00']]),
}

let disponibilidades = lerArmazenado<Record<number, Disponibilidade[]>>(CHAVE_DISPONIBILIDADES, disponibilidadesIniciais)

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
  if (apiAtiva('profissionais')) {
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
  if (apiAtiva('profissionais')) {
    return requisicao('/api/profissionais', { method: 'POST', body: JSON.stringify(dados) })
  }

  await esperar(500)
  garantirEmailUnico(dados.email)
  const id = Math.max(0, ...profissionais.map((item) => item.id)) + 1
  const novo: ProfissionalSalvo = { ...dados, id }
  salvar([...profissionais, novo])
  registrarAtividade('profissional', `${novo.nome} entrou na equipe`)
  return paraResposta(novo)
}

export async function atualizarProfissional(id: number, dados: ProfissionalEntrada): Promise<Profissional> {
  if (apiAtiva('profissionais')) {
    return requisicao(`/api/profissionais/${id}`, { method: 'PUT', body: JSON.stringify(dados) })
  }

  await esperar(500)
  buscarPorId(id)
  garantirEmailUnico(dados.email, id)
  const atualizado: ProfissionalSalvo = { ...dados, id }
  salvar(profissionais.map((item) => (item.id === id ? atualizado : item)))
  registrarAtividade('profissional', `Dados de ${atualizado.nome} atualizados`)
  return paraResposta(atualizado)
}

export async function alterarStatusProfissional(id: number, ativo: boolean): Promise<Profissional> {
  if (apiAtiva('profissionais')) {
    return requisicao(`/api/profissionais/${id}/${ativo ? 'ativar' : 'desativar'}`, { method: 'PATCH' })
  }

  await esperar(300)
  const atualizado: ProfissionalSalvo = { ...buscarPorId(id), ativo }
  salvar(profissionais.map((item) => (item.id === id ? atualizado : item)))
  registrarAtividade('profissional', `${atualizado.nome} foi ${ativo ? 'ativado' : 'desativado'}`)
  return paraResposta(atualizado)
}

export async function excluirProfissional(id: number): Promise<void> {
  if (apiAtiva('profissionais')) {
    return requisicao(`/api/profissionais/${id}`, { method: 'DELETE' })
  }

  await esperar(500)
  const removido = buscarPorId(id)
  salvar(profissionais.filter((item) => item.id !== id))
  registrarAtividade('profissional', `${removido.nome} foi removido da equipe`)
  const restantes = { ...disponibilidades }
  delete restantes[id]
  disponibilidades = restantes
  salvarArmazenado(CHAVE_DISPONIBILIDADES, restantes)
}

export async function listarDisponibilidades(profissionalId: number): Promise<Disponibilidade[]> {
  if (apiAtiva('profissionais')) {
    const lista = await requisicao<Disponibilidade[]>(`/api/profissionais/${profissionalId}/disponibilidades`)
    return ordenarIntervalos(
      lista.map((item) => ({ ...item, horaInicio: normalizarHora(item.horaInicio), horaFim: normalizarHora(item.horaFim) })),
    )
  }

  await esperar()
  buscarPorId(profissionalId)
  return ordenarIntervalos(disponibilidades[profissionalId] ?? [])
}

export async function salvarDisponibilidades(profissionalId: number, lista: Disponibilidade[]): Promise<Disponibilidade[]> {
  const ordenada = ordenarIntervalos(lista)

  if (apiAtiva('profissionais')) {
    return requisicao(`/api/profissionais/${profissionalId}/disponibilidades`, {
      method: 'PUT',
      body: JSON.stringify(ordenada),
    })
  }

  await esperar(500)
  const profissional = buscarPorId(profissionalId)
  disponibilidades = { ...disponibilidades, [profissionalId]: ordenada }
  salvarArmazenado(CHAVE_DISPONIBILIDADES, disponibilidades)
  registrarAtividade('profissional', `Horários de ${profissional.nome} atualizados`)
  return ordenada
}