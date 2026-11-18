import { useSyncExternalStore } from 'react';
import { catalogosDemo } from '../dados/dadosDemo';
import { agendamentosStore } from '../store/agendamentosStore';
import type { AgendamentoDetalhado, Catalogos } from '../types';

const obterDetalhados = (): readonly AgendamentoDetalhado[] => agendamentosStore.obterEstado().detalhados;

/** Lista (sempre atualizada) de agendamentos já cruzados com cliente, profissional e serviço. */
export function useAgendamentosDetalhados(): readonly AgendamentoDetalhado[] {
  return useSyncExternalStore(agendamentosStore.assinar, obterDetalhados, obterDetalhados);
}

/** Clientes, profissionais e serviços. Hoje são dados demonstrativos; futuramente virão da API. */
export function useCatalogos(): Catalogos {
  return catalogosDemo;
}