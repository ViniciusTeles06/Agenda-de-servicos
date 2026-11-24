/**
 * Armazenamento em memória dos agendamentos, compartilhado por Agendamentos e Calendário.
 *
 * - Vive no módulo (não em um Provider): assim as duas telas enxergam os mesmos dados mesmo sem
 *   nenhuma alteração em App.tsx/rotas e mesmo trocando de página durante a sessão.
 * - Os dados NÃO são persistidos (nenhum armazenamento do navegador, banco de dados ou rede):
 *   recarregar a página volta aos dados demonstrativos.
 * - Para integrar um backend no futuro, troque o corpo das ações (criar, atualizar, alterarStatus...)
 *   por chamadas de API mantendo estas assinaturas e o formato ResultadoOperacao.
 */
import { catalogosDemo, criarAgendamentosDemo } from '../dados/dadosDemo';
import type {
  Agendamento,
  AgendamentoDetalhado,
  DadosAgendamento,
  ErrosAgendamento,
  ResultadoOperacao,
  StatusAgendamento,
} from '../types';
import { horaParaMin, minParaHora } from '../utils/datas';
import { montarIndiceBusca } from '../utils/filtros';
import { validarAgendamento } from '../utils/regras';

export interface EstadoAgendamentos {
  readonly agendamentos: readonly Agendamento[];
  readonly detalhados: readonly AgendamentoDetalhado[];
  readonly proximoNumero: number;
}

export interface ResultadoLote {
  alterados: number;
  /** Já estavam no status pedido. */
  ignorados: number;
  /** Não puderam mudar (ex.: horário ocupado ao reabrir). */
  falhas: number;
}

const clientesPorId = new Map(catalogosDemo.clientes.map((c) => [c.id, c] as const));
const profissionaisPorId = new Map(catalogosDemo.profissionais.map((p) => [p.id, p] as const));
const servicosPorId = new Map(catalogosDemo.servicos.map((s) => [s.id, s] as const));

function detalhar(ag: Agendamento): AgendamentoDetalhado | null {
  const cliente = clientesPorId.get(ag.clienteId);
  const profissional = profissionaisPorId.get(ag.profissionalId);
  const servico = servicosPorId.get(ag.servicoId);
  if (!cliente || !profissional || !servico) return null;
  const inicioMin = horaParaMin(ag.hora);
  const fimMin = inicioMin + ag.duracaoMin;
  return {
    ...ag,
    cliente,
    profissional,
    servico,
    inicioMin,
    fimMin,
    horaFim: minParaHora(fimMin),
    chave: `${ag.data}T${ag.hora}`,
    indiceBusca: montarIndiceBusca({
      clienteNome: cliente.nome,
      clienteEmail: cliente.email,
      servicoNome: servico.nome,
      profissionalNome: profissional.nome,
      data: ag.data,
      hora: ag.hora,
    }),
  };
}

function montarEstado(agendamentos: readonly Agendamento[], proximoNumero: number): EstadoAgendamentos {
  const detalhados: AgendamentoDetalhado[] = [];
  for (const ag of agendamentos) {
    const d = detalhar(ag);
    if (d) detalhados.push(d);
  }
  return { agendamentos, detalhados, proximoNumero };
}

const iniciais = criarAgendamentosDemo();
let estado: EstadoAgendamentos = montarEstado(iniciais, iniciais.length + 1);
const ouvintes = new Set<() => void>();

function publicar(proximo: EstadoAgendamentos): void {
  estado = proximo;
  ouvintes.forEach((avisar) => avisar());
}

/** Reabrir um cancelado exige que o horário ainda esteja livre. */
function errosAoReabrir(atual: Agendamento, lista: readonly Agendamento[], agora: Date): ErrosAgendamento {
  return validarAgendamento(atual, {
    agendamentos: lista,
    catalogos: catalogosDemo,
    agora,
    original: atual,
  });
}

function mensagemReabrir(erros: ErrosAgendamento): string {
  return `Não foi possível reabrir: ${erros.hora ?? erros.data ?? erros.servicoId ?? 'o horário não está mais disponível'}`;
}

export const agendamentosStore = {
  obterEstado(): EstadoAgendamentos {
    return estado;
  },

  assinar(ouvinte: () => void): () => void {
    ouvintes.add(ouvinte);
    return () => {
      ouvintes.delete(ouvinte);
    };
  },

  /** Cria um agendamento (nasce como "aguardando"). Revalida tudo antes de gravar. */
  criar(dados: DadosAgendamento, agora: Date = new Date()): ResultadoOperacao<Agendamento> {
    const erros = validarAgendamento(dados, { agendamentos: estado.agendamentos, catalogos: catalogosDemo, agora });
    if (Object.keys(erros).length > 0) return { ok: false, erros };
    const servico = servicosPorId.get(dados.servicoId);
    if (!servico) return { ok: false, erros: { servicoId: 'Serviço não encontrado. Selecione outro.' } };

    const novo: Agendamento = {
      id: `ag-${String(estado.proximoNumero).padStart(3, '0')}`,
      clienteId: dados.clienteId,
      profissionalId: dados.profissionalId,
      servicoId: dados.servicoId,
      data: dados.data,
      hora: dados.hora,
      duracaoMin: servico.duracaoMin,
      status: 'aguardando',
    };
    publicar(montarEstado(estado.agendamentos.concat(novo), estado.proximoNumero + 1));
    return { ok: true, dados: novo };
  },

  /** Edita cliente, profissional, serviço, data e horário (o status é preservado). */
  atualizar(id: string, dados: DadosAgendamento, agora: Date = new Date()): ResultadoOperacao<Agendamento> {
    const original = estado.agendamentos.find((a) => a.id === id);
    if (!original) return { ok: false, erros: { geral: 'Agendamento não encontrado.' } };
    const erros = validarAgendamento(dados, { agendamentos: estado.agendamentos, catalogos: catalogosDemo, agora, original });
    if (Object.keys(erros).length > 0) return { ok: false, erros };
    const servico = servicosPorId.get(dados.servicoId);
    if (!servico) return { ok: false, erros: { servicoId: 'Serviço não encontrado. Selecione outro.' } };

    const atualizado: Agendamento = {
      ...original,
      clienteId: dados.clienteId,
      profissionalId: dados.profissionalId,
      servicoId: dados.servicoId,
      data: dados.data,
      hora: dados.hora,
      duracaoMin: servico.duracaoMin,
    };
    publicar(montarEstado(estado.agendamentos.map((a) => (a.id === id ? atualizado : a)), estado.proximoNumero));
    return { ok: true, dados: atualizado };
  },

  alterarStatus(id: string, status: StatusAgendamento, agora: Date = new Date()): ResultadoOperacao<Agendamento> {
    const atual = estado.agendamentos.find((a) => a.id === id);
    if (!atual) return { ok: false, erros: { geral: 'Agendamento não encontrado.' } };
    if (atual.status === status) return { ok: true, dados: atual };
    if (atual.status === 'cancelado') {
      const erros = errosAoReabrir(atual, estado.agendamentos, agora);
      if (Object.keys(erros).length > 0) return { ok: false, erros: { geral: mensagemReabrir(erros) } };
    }
    const atualizado: Agendamento = { ...atual, status };
    publicar(montarEstado(estado.agendamentos.map((a) => (a.id === id ? atualizado : a)), estado.proximoNumero));
    return { ok: true, dados: atualizado };
  },

  alterarStatusEmLote(ids: readonly string[], status: StatusAgendamento, agora: Date = new Date()): ResultadoLote {
    let lista = estado.agendamentos.slice();
    const resultado: ResultadoLote = { alterados: 0, ignorados: 0, falhas: 0 };
    for (const id of Array.from(new Set(ids))) {
      const indice = lista.findIndex((a) => a.id === id);
      const atual = indice >= 0 ? lista[indice] : undefined;
      if (!atual) {
        resultado.falhas += 1;
        continue;
      }
      if (atual.status === status) {
        resultado.ignorados += 1;
        continue;
      }
      if (atual.status === 'cancelado' && Object.keys(errosAoReabrir(atual, lista, agora)).length > 0) {
        resultado.falhas += 1;
        continue;
      }
      lista = lista.map((a, i) => (i === indice ? { ...a, status } : a));
      resultado.alterados += 1;
    }
    if (resultado.alterados > 0) publicar(montarEstado(lista, estado.proximoNumero));
    return resultado;
  },
};