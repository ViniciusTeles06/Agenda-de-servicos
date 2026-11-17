export interface Servico {
  id: number
  nome: string
  descricao: string | null
  duracaoMinutos: number
  ativo: boolean
  totalProfissionais: number
}

export interface ServicoEntrada {
  nome: string
  descricao: string | null
  duracaoMinutos: number
  ativo: boolean
}

export type FiltroStatus = 'todos' | 'ativos' | 'inativos'

export interface FiltrosServico {
  busca: string
  status: FiltroStatus
  pagina: number
  tamanho: number
}