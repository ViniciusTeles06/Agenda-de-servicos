import type { ColunaOpcional, FiltroStatus, StatusAgendamento } from './types';

export const ROTULO_STATUS: Readonly<Record<StatusAgendamento, string>> = {
  confirmado: 'Confirmado',
  aguardando: 'Aguardando',
  cancelado: 'Cancelado',
};

export const ABAS_STATUS: ReadonlyArray<{ id: FiltroStatus; rotulo: string }> = [
  { id: 'todos', rotulo: 'Todos os agendamentos' },
  { id: 'confirmado', rotulo: 'Confirmados' },
  { id: 'aguardando', rotulo: 'Aguardando' },
  { id: 'cancelado', rotulo: 'Cancelados' },
];

export const COLUNAS_OPCIONAIS: ReadonlyArray<{ id: ColunaOpcional; rotulo: string }> = [
  { id: 'servico', rotulo: 'Serviço' },
  { id: 'status', rotulo: 'Status' },
  { id: 'responsavel', rotulo: 'Responsável' },
  { id: 'data', rotulo: 'Data e horário' },
];

export const COLUNAS_PADRAO: Readonly<Record<ColunaOpcional, boolean>> = {
  servico: true,
  status: true,
  responsavel: true,
  data: true,
};

export const LINHAS_POR_PAGINA_OPCOES: readonly number[] = [8, 16, 32, 64];
export const LINHAS_POR_PAGINA_PADRAO = 8;

/** Intervalo (min) entre os horários de início oferecidos no agendamento. */
export const PASSO_AGENDA_MIN = 30;

/** Rotas registradas no App.tsx, dentro do layout /app. */
export const ROTAS_SUGERIDAS = {
  agendamentos: '/app/agendamentos',
  calendario: '/app/calendario',
} as const;