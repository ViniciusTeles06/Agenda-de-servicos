export interface EnderecoCliente {
  cep: string
  rua: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  uf: string
}

export interface Cliente {
  id: number
  nome: string
  email: string
  telefone: string | null
  endereco: EnderecoCliente
}

export type ClienteEntrada = Omit<Cliente, 'id'>

export interface FiltrosCliente {
  busca: string
  pagina: number
  tamanho: number
}
