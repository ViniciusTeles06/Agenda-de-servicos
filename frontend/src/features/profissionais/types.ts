export interface ServicoResumo {
  id: number
  nome: string
}

export interface Profissional {
  id: number
  nome: string
  email: string
  telefone: string | null
  ativo: boolean
  servicos: ServicoResumo[]
}

export interface ProfissionalEntrada {
  nome: string
  email: string
  telefone: string | null
  ativo: boolean
  servicoIds: number[]
}

export type FiltroStatus = 'todos' | 'ativos' | 'inativos'

export interface FiltrosProfissional {
  busca: string
  status: FiltroStatus
  pagina: number
  tamanho: number
}

export interface Disponibilidade {
  diaSemana: number
  horaInicio: string
  horaFim: string
}