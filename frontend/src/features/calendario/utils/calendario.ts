import { ROTULO_STATUS } from '../../agendamentos/constants';
import type { AgendamentoDetalhado } from '../../agendamentos/types';
import {
  deIsoData,
  formatarDataExtensa,
  gradeDoMes,
  inicioDaSemana,
  paraIsoData,
  rotuloMes,
  rotuloSemana,
  somarDias,
  somarMeses,
} from '../../agendamentos/utils/datas';

export type VisaoCalendario = 'mes' | 'semana' | 'dia';

/** Faixa de horas exibida por padrão nas visões semanal e diária. */
export const HORA_INICIAL_PADRAO_MIN = 7 * 60;
export const HORA_FINAL_PADRAO_MIN = 19 * 60;
export const ALTURA_HORA_PX = 52;
export const PX_POR_MINUTO = ALTURA_HORA_PX / 60;
/** Cliques na grade "encaixam" nesse intervalo (igual ao passo da agenda). */
export const PASSO_CLIQUE_MIN = 30;

export function agruparPorDia(
  lista: readonly AgendamentoDetalhado[],
): Map<string, AgendamentoDetalhado[]> {
  const mapa = new Map<string, AgendamentoDetalhado[]>();
  for (const ag of lista) {
    const atual = mapa.get(ag.data);
    if (atual) atual.push(ag);
    else mapa.set(ag.data, [ag]);
  }
  mapa.forEach((itens) => itens.sort((a, b) => a.inicioMin - b.inicioMin || a.id.localeCompare(b.id)));
  return mapa;
}

export interface EventoPosicionado {
  agendamento: AgendamentoDetalhado;
  /** Coluna (0-based) dentro do grupo de eventos que se sobrepõem. */
  coluna: number;
  /** Quantas colunas o grupo ocupa (define a largura de cada evento). */
  colunas: number;
}

/** Distribui eventos sobrepostos lado a lado (como Google Agenda). */
export function posicionarEventos(eventos: readonly AgendamentoDetalhado[]): EventoPosicionado[] {
  const ordenados = eventos
    .slice()
    .sort((a, b) => a.inicioMin - b.inicioMin || b.fimMin - a.fimMin || a.id.localeCompare(b.id));
  const resultado: EventoPosicionado[] = [];
  let grupo: Array<{ agendamento: AgendamentoDetalhado; coluna: number }> = [];
  let fimPorColuna: number[] = [];
  let fimGrupo = -1;

  const fecharGrupo = () => {
    const colunas = fimPorColuna.length;
    for (const item of grupo) resultado.push({ ...item, colunas });
    grupo = [];
    fimPorColuna = [];
    fimGrupo = -1;
  };

  for (const ag of ordenados) {
    if (grupo.length > 0 && ag.inicioMin >= fimGrupo) fecharGrupo();
    let coluna = fimPorColuna.findIndex((fim) => fim <= ag.inicioMin);
    if (coluna === -1) {
      coluna = fimPorColuna.length;
      fimPorColuna.push(ag.fimMin);
    } else {
      fimPorColuna[coluna] = ag.fimMin;
    }
    grupo.push({ agendamento: ag, coluna });
    fimGrupo = Math.max(fimGrupo, ag.fimMin);
  }
  if (grupo.length > 0) fecharGrupo();
  return resultado;
}

/** 07:00–19:00, ampliado (em horas cheias) se algum evento ficar fora. */
export function calcularFaixaHoras(eventos: readonly AgendamentoDetalhado[]): { inicioMin: number; fimMin: number } {
  let inicioMin = HORA_INICIAL_PADRAO_MIN;
  let fimMin = HORA_FINAL_PADRAO_MIN;
  for (const e of eventos) {
    inicioMin = Math.min(inicioMin, Math.floor(e.inicioMin / 60) * 60);
    fimMin = Math.max(fimMin, Math.ceil(e.fimMin / 60) * 60);
  }
  return { inicioMin, fimMin: Math.min(fimMin, 24 * 60) };
}

export function diasDaVisao(visao: VisaoCalendario, dataRef: Date): Date[] {
  if (visao === 'mes') return gradeDoMes(dataRef);
  if (visao === 'semana') {
    const inicio = inicioDaSemana(dataRef);
    return Array.from({ length: 7 }, (_, i) => somarDias(inicio, i));
  }
  return [somarDias(dataRef, 0)];
}

export function navegar(visao: VisaoCalendario, dataRef: Date, sentido: -1 | 1): Date {
  if (visao === 'mes') return somarMeses(dataRef, sentido);
  if (visao === 'semana') return somarDias(dataRef, 7 * sentido);
  return somarDias(dataRef, sentido);
}

export function tituloDaVisao(visao: VisaoCalendario, dataRef: Date): string {
  if (visao === 'mes') return rotuloMes(dataRef);
  if (visao === 'semana') return rotuloSemana(dataRef);
  return formatarDataExtensa(paraIsoData(dataRef));
}

/** Primeiro e último dia (AAAA-MM-DD) do período principal da visão (o mês, a semana ou o dia). */
export function limitesDoPeriodo(visao: VisaoCalendario, dataRef: Date): { de: string; ate: string } {
  if (visao === 'mes') {
    return {
      de: paraIsoData(new Date(dataRef.getFullYear(), dataRef.getMonth(), 1)),
      ate: paraIsoData(new Date(dataRef.getFullYear(), dataRef.getMonth() + 1, 0)),
    };
  }
  if (visao === 'semana') {
    const inicio = inicioDaSemana(dataRef);
    return { de: paraIsoData(inicio), ate: paraIsoData(somarDias(inicio, 6)) };
  }
  const dia = paraIsoData(dataRef);
  return { de: dia, ate: dia };
}

/**
 * Data em que o calendário abre: hoje, se houver agendamentos no mês atual; senão o dia do
 * agendamento mais recente (evita abrir em um mês vazio quando só há dados antigos).
 */
export function escolherDataInicial(lista: readonly AgendamentoDetalhado[], hoje: Date): Date {
  const mesAtual = paraIsoData(hoje).slice(0, 7);
  if (lista.length === 0 || lista.some((a) => a.data.startsWith(mesAtual))) return hoje;
  const maisRecente = lista.reduce((a, b) => (b.data > a.data ? b : a));
  return deIsoData(maisRecente.data);
}

/** Texto lido por leitores de tela para cada evento (cliente, serviço, responsável, quando e status). */
export function descreverAgendamento(ag: AgendamentoDetalhado): string {
  return `${ag.cliente.nome}, ${ag.servico.nome}, com ${ag.profissional.nome}, ${formatarDataExtensa(ag.data)}, das ${ag.hora} às ${ag.horaFim}, ${ROTULO_STATUS[ag.status].toLowerCase()}`;
}