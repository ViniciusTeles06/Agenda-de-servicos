export type StatusAgendamento = 'confirmado' | 'aguardando' | 'cancelado';
export type FiltroStatus = StatusAgendamento | 'todos';
export type DirecaoOrdenacao = 'asc' | 'desc';
export type ColunaOpcional = 'servico' | 'status' | 'responsavel' | 'data';

export interface Cliente {
  id: string;
  nome: string;
  email: string;
}

export interface Servico {
  id: string;
  nome: string;

  duracaoMin: number;
}

export interface Expediente {
  
  inicio: string;
  
  fim: string;
  
  diasSemana: readonly number[];
}

export interface Profissional {
  id: string;
  nome: string;
  
  servicosIds: readonly string[];
  expediente: Expediente;
}

export interface Catalogos {
  clientes: readonly Cliente[];
  profissionais: readonly Profissional[];
  servicos: readonly Servico[];
}


export interface DadosAgendamento {
  clienteId: string;
  profissionalId: string;
  servicoId: string;
  
  data: string;

  hora: string;
}

export interface Agendamento extends DadosAgendamento {
  id: string;
  
  duracaoMin: number;
  status: StatusAgendamento;
}


export interface AgendamentoDetalhado extends Agendamento {
  cliente: Cliente;
  profissional: Profissional;
  servico: Servico;
  inicioMin: number;
  fimMin: number;
  horaFim: string;
  
  chave: string;

  indiceBusca: string;
}

export type CampoAgendamento = keyof DadosAgendamento;
export type ErrosAgendamento = Partial<Record<CampoAgendamento | 'geral', string>>;

export type ResultadoOperacao<T> =
  | { ok: true; dados: T }
  | { ok: false; erros: ErrosAgendamento };

export interface HorarioDisponivel {
  hora: string;
  disponivel: boolean;

  motivo?: string;
}

export interface ResultadoHorarios {
  horarios: HorarioDisponivel[];
 
  aviso?: string;
}