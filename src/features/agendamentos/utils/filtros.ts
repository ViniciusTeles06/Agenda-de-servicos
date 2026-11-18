import type { AgendamentoDetalhado, DirecaoOrdenacao, FiltroStatus } from '../types';
import { DIAS_SEMANA, MESES, MESES_CURTOS, deIsoData, formatarDataBR } from './datas';

export interface FiltrosLista {
  status: FiltroStatus;
  busca: string;
  /** "todos" ou o id do profissional (filtro "Responsável"). */
  profissionalId: string;
  /** "todos" ou o id do serviço (painel "Filtros"). */
  servicoId: string;
  /** AAAA-MM-DD ou vazio. */
  dataDe: string;
  dataAte: string;
}

export const FILTROS_INICIAIS: FiltrosLista = {
  status: 'todos',
  busca: '',
  profissionalId: 'todos',
  servicoId: 'todos',
  dataDe: '',
  dataAte: '',
};

/** Minúsculas e sem acentos: "Reunião" → "reuniao". */
export function normalizarTexto(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/** Monta o texto pesquisável (cliente, serviço, responsável e várias formas de escrever a data). */
export function montarIndiceBusca(partes: {
  clienteNome: string;
  clienteEmail: string;
  servicoNome: string;
  profissionalNome: string;
  data: string;
  hora: string;
}): string {
  const d = deIsoData(partes.data);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  return normalizarTexto(
    [
      partes.clienteNome,
      partes.clienteEmail,
      partes.servicoNome,
      partes.profissionalNome,
      formatarDataBR(partes.data),
      `${dia}/${mes}`,
      partes.data,
      `${dia} ${MESES_CURTOS[d.getMonth()]} ${d.getFullYear()}`,
      MESES[d.getMonth()],
      DIAS_SEMANA[d.getDay()],
      partes.hora,
    ].join(' '),
  );
}

/** Quantidade de filtros ativos no painel "Filtros" (serviço e período). */
export function contarFiltrosAdicionais(f: FiltrosLista): number {
  return (f.servicoId !== 'todos' ? 1 : 0) + (f.dataDe ? 1 : 0) + (f.dataAte ? 1 : 0);
}

export function filtrarAgendamentos(
  lista: readonly AgendamentoDetalhado[],
  f: FiltrosLista,
  opcoes: { ignorarStatus?: boolean } = {},
): AgendamentoDetalhado[] {
  const termos = normalizarTexto(f.busca).split(/\s+/).filter(Boolean);
  return lista.filter((ag) => {
    if (!opcoes.ignorarStatus && f.status !== 'todos' && ag.status !== f.status) return false;
    if (f.profissionalId !== 'todos' && ag.profissionalId !== f.profissionalId) return false;
    if (f.servicoId !== 'todos' && ag.servicoId !== f.servicoId) return false;
    if (f.dataDe && ag.data < f.dataDe) return false;
    if (f.dataAte && ag.data > f.dataAte) return false;
    return termos.every((t) => ag.indiceBusca.includes(t));
  });
}

/**
 * Ordena por dia, de acordo com a seta da coluna "Data e horário". Dentro do mesmo dia o horário
 * é sempre crescente — é a ordem do protótipo do Figma (03 nov. mostra 11:00 antes de 14:00 mesmo com ↓).
 * Para ordenação estritamente decrescente (dia e hora), inverta também o critério de `hora` abaixo.
 */
export function ordenarPorDataHora(
  lista: readonly AgendamentoDetalhado[],
  direcao: DirecaoOrdenacao,
): AgendamentoDetalhado[] {
  const sinal = direcao === 'asc' ? 1 : -1;
  return lista.slice().sort((a, b) => {
    if (a.data !== b.data) return a.data < b.data ? -sinal : sinal;
    if (a.hora !== b.hora) return a.hora < b.hora ? -1 : 1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

export function contarPorStatus(
  lista: readonly AgendamentoDetalhado[],
): Record<FiltroStatus, number> {
  const contagem: Record<FiltroStatus, number> = { todos: lista.length, confirmado: 0, aguardando: 0, cancelado: 0 };
  for (const ag of lista) contagem[ag.status] += 1;
  return contagem;
}

export interface ResultadoPaginacao<T> {
  itens: T[];
  total: number;
  totalPaginas: number;
  paginaAtual: number;
  /** Posição (1-based) do primeiro item exibido; 0 quando a lista está vazia. */
  de: number;
  ate: number;
}

export function paginar<T>(itens: readonly T[], pagina: number, porPagina: number): ResultadoPaginacao<T> {
  const total = itens.length;
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  const paginaAtual = Math.min(Math.max(1, pagina), totalPaginas);
  const inicio = (paginaAtual - 1) * porPagina;
  const fim = Math.min(inicio + porPagina, total);
  return {
    itens: itens.slice(inicio, fim),
    total,
    totalPaginas,
    paginaAtual,
    de: total === 0 ? 0 : inicio + 1,
    ate: fim,
  };
}

export type ItemPaginacao = number | 'reticencias-inicio' | 'reticencias-fim';

/** 1 2 3 … 16  |  1 … 7 8 9 … 16  |  1 … 14 15 16 */
export function gerarPaginas(atual: number, total: number): ItemPaginacao[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (atual <= 3) return [1, 2, 3, 'reticencias-fim', total];
  if (atual >= total - 2) return [1, 'reticencias-inicio', total - 2, total - 1, total];
  return [1, 'reticencias-inicio', atual - 1, atual, atual + 1, 'reticencias-fim', total];
}