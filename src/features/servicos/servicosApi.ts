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
import type { FiltrosServico, Servico, ServicoEntrada } from './types'

const CHAVE = 'servicehub:servicos'

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
  if (usandoApiReal) {
    const query = montarQuery({
      busca: filtros.busca,
      ativo: filtros.status === 'todos' ? undefined : filtros.status === 'ativos',
      page: filtros.pagina,
      size: filtros.tamanho,
      sort: 'nome,asc',
    })
    return requisicao(`/api/servicos${query}`)
  }

  await esperar()
  const termo = normalizarTexto(filtros.busca)

  const filtrados = servicos
    .filter((item) => filtros.status === 'todos' || item.ativo === (filtros.status === 'ativos'))
    .filter((item) => !termo || normalizarTexto(`${item.nome} ${item.descricao ?? ''}`).includes(termo))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  return paginar(filtrados, filtros.pagina, filtros.tamanho)
}

export async function criarServico(dados: ServicoEntrada): Promise<Servico> {
  if (usandoApiReal) {
    return requisicao('/api/servicos', { method: 'POST', body: JSON.stringify(dados) })
  }

  await esperar(500)
  garantirNomeUnico(dados.nome)
  const id = Math.max(0, ...servicos.map((item) => item.id)) + 1
  const novo: Servico = { ...dados, id, totalProfissionais: 0 }
  salvar([...servicos, novo])
  return novo
}

export async function atualizarServico(id: number, dados: ServicoEntrada): Promise<Servico> {
  if (usandoApiReal) {
    return requisicao(`/api/servicos/${id}`, { method: 'PUT', body: JSON.stringify(dados) })
  }

  await esperar(500)
  const atual = buscarPorId(id)
  garantirNomeUnico(dados.nome, id)
  const atualizado: Servico = { ...atual, ...dados }
  salvar(servicos.map((item) => (item.id === id ? atualizado : item)))
  return atualizado
}

export async function alterarStatusServico(id: number, ativo: boolean): Promise<Servico> {
  if (usandoApiReal) {
    return requisicao(`/api/servicos/${id}/${ativo ? 'ativar' : 'desativar'}`, { method: 'PATCH' })
  }

  await esperar(300)
  const atualizado: Servico = { ...buscarPorId(id), ativo }
  salvar(servicos.map((item) => (item.id === id ? atualizado : item)))
  return atualizado
}

export async function excluirServico(id: number): Promise<void> {
  if (usandoApiReal) {
    return requisicao(`/api/servicos/${id}`, { method: 'DELETE' })
  }

  await esperar(500)
  const servico = buscarPorId(id)

  if (servico.totalProfissionais > 0) {
    throw new ApiError(409, 'Esse serviço está vinculado a profissionais. Desative em vez de excluir.')
  }

  salvar(servicos.filter((item) => item.id !== id))
}