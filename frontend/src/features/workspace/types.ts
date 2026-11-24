export type StatusAgendamento = 'confirmado' | 'aguardando' | 'cancelado'

export interface ContagemStatus {
  total: number
  confirmados: number
  aguardando: number
  cancelados: number
}

export interface DiaDaSemana {
  data: string
  total: number
}

export interface ServicoAgendado {
  id: number
  nome: string
  total: number
}

export interface ProximoAtendimento {
  id: number
  inicio: string
  duracaoMinutos: number
  clienteNome: string
  servicoNome: string
  profissionalNome: string
  status: StatusAgendamento
}

export interface ResumoWorkspace {
  hoje: ContagemStatus
  ontem: ContagemStatus
  semana: DiaDaSemana[]
  servicosMaisAgendados: ServicoAgendado[]
  proximos: ProximoAtendimento[]
}