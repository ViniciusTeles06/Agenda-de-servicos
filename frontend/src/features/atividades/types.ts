export type TipoAtividade = 'agendamento' | 'servico' | 'profissional'

export interface Atividade {
  id: number
  tipo: TipoAtividade
  descricao: string
  autor: string
  criadoEm: string
}

export type FiltroTipo = TipoAtividade | 'todas'

export interface FiltrosAtividade {
  tipo: FiltroTipo
  pagina: number
  tamanho: number
}