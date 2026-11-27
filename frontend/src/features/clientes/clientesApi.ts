import { ApiError, esperar, lerArmazenado, normalizarTexto, paginar, salvarArmazenado } from '../../lib/api'
import type { Pagina } from '../../lib/api'
import type { Cliente, ClienteEntrada, FiltrosCliente } from './types'

const CHAVE_CLIENTES = 'servicehub:clientes'

const iniciais: Cliente[] = [
  {
    id: 1,
    nome: 'Mariana Alves',
    email: 'mariana.alves@exemplo.com',
    telefone: '82999990011',
    endereco: { cep: '57035090', rua: 'Rua Deputado José Lages', numero: '420', complemento: 'Apto. 402', bairro: 'Ponta Verde', cidade: 'Maceió', uf: 'AL' },
  },
  {
    id: 2,
    nome: 'Pedro Henrique',
    email: 'pedro.henrique@exemplo.com',
    telefone: '82999990012',
    endereco: { cep: '57036120', rua: 'Avenida Álvaro Otacílio', numero: '690', complemento: '', bairro: 'Jatiúca', cidade: 'Maceió', uf: 'AL' },
  },
  {
    id: 3,
    nome: 'Juliana Costa',
    email: 'juliana.costa@exemplo.com',
    telefone: '82999990013',
    endereco: { cep: '57052010', rua: 'Rua do Comércio', numero: '85', complemento: '', bairro: 'Farol', cidade: 'Maceió', uf: 'AL' },
  },
]

let clientes = lerArmazenado<Cliente[]>(CHAVE_CLIENTES, iniciais)
salvarArmazenado(CHAVE_CLIENTES, clientes)

function salvar(lista: Cliente[]) {
  clientes = lista
  salvarArmazenado(CHAVE_CLIENTES, lista)
}

function buscarPorId(id: number) {
  const cliente = clientes.find((item) => item.id === id)
  if (!cliente) throw new ApiError(404, 'Cliente não encontrado.')
  return cliente
}

function garantirEmailUnico(email: string, ignorarId?: number) {
  const repetido = clientes.some((item) => item.id !== ignorarId && item.email.toLowerCase() === email.toLowerCase())
  if (repetido) throw new ApiError(409, 'Já existe um cliente com esse e-mail.')
}

export async function listarClientes(filtros: FiltrosCliente): Promise<Pagina<Cliente>> {
  await esperar()
  const termo = normalizarTexto(filtros.busca)
  const filtrados = clientes
    .filter((cliente) => !termo || normalizarTexto(`${cliente.nome} ${cliente.email} ${cliente.telefone ?? ''} ${cliente.endereco.cidade}`).includes(termo))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  return paginar(filtrados, filtros.pagina, filtros.tamanho)
}

export async function criarCliente(dados: ClienteEntrada): Promise<Cliente> {
  await esperar(450)
  garantirEmailUnico(dados.email)
  const novo = { ...dados, id: Math.max(0, ...clientes.map((item) => item.id)) + 1 }
  salvar([...clientes, novo])
  return novo
}

export async function atualizarCliente(id: number, dados: ClienteEntrada): Promise<Cliente> {
  await esperar(450)
  buscarPorId(id)
  garantirEmailUnico(dados.email, id)
  const atualizado = { ...dados, id }
  salvar(clientes.map((item) => (item.id === id ? atualizado : item)))
  return atualizado
}

export async function excluirCliente(id: number) {
  await esperar(350)
  buscarPorId(id)
  salvar(clientes.filter((item) => item.id !== id))
}
