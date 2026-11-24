/**
 * Dados demonstrativos (somente em memória). Nada aqui é persistido.
 * As 8 primeiras linhas (por data) reproduzem exatamente a tela do Figma; o restante é gerado
 * de forma determinística para totalizar 128 agendamentos (96 confirmados, 20 aguardando, 12 cancelados).
 * Para integrar um backend, substitua este módulo por chamadas de API (ver store/agendamentosStore.ts).
 */
import { PASSO_AGENDA_MIN } from '../constants';
import type { Agendamento, Catalogos, Cliente, Profissional, Servico, StatusAgendamento } from '../types';
import { deIsoData, horaParaMin, paraIsoData, somarDias } from '../utils/datas';
import { encontrarConflitos } from '../utils/regras';

export const clientesDemo: readonly Cliente[] = [
  { id: 'cli-01', nome: 'Ana Beatriz Costa', email: 'ana.costa@aurora.com.br' },
  { id: 'cli-02', nome: 'Bruno Almeida', email: 'bruno@vertice.tech' },
  { id: 'cli-03', nome: 'Camila Rodrigues', email: 'camila@casaflora.com.br' },
  { id: 'cli-04', nome: 'Daniel Oliveira', email: 'daniel@grupoprisma.com.br' },
  { id: 'cli-05', nome: 'Fernanda Lima', email: 'fernanda@atellenorte.com.br' },
  { id: 'cli-06', nome: 'Gabriel Santos', email: 'gabriel@movimentosaude.com.br' },
  { id: 'cli-07', nome: 'Helena Ferreira', email: 'helena@origemalimentos.com.br' },
  { id: 'cli-08', nome: 'João Pedro Mendes', email: 'joao@elevamarketing.com.br' },
  { id: 'cli-09', nome: 'Isabela Martins', email: 'isabela@lumeestudio.com.br' },
  { id: 'cli-10', nome: 'Leonardo Pires', email: 'leonardo@nortelog.com.br' },
  { id: 'cli-11', nome: 'Mariana Souza', email: 'mariana@brisaclinica.com.br' },
  { id: 'cli-12', nome: 'Nicolas Barbosa', email: 'nicolas@pontoazul.com.br' },
  { id: 'cli-13', nome: 'Patrícia Nogueira', email: 'patricia@raizes.org.br' },
  { id: 'cli-14', nome: 'Rodrigo Teixeira', email: 'rodrigo@fluxocontabil.com.br' },
  { id: 'cli-15', nome: 'Sofia Carvalho', email: 'sofia@ateliemarola.com.br' },
  { id: 'cli-16', nome: 'Thiago Ramos', email: 'thiago@orbita.dev' },
];

export const servicosDemo: readonly Servico[] = [
  { id: 'consulta-design', nome: 'Consulta de design', duracaoMin: 60 },
  { id: 'revisao-site', nome: 'Revisão de site', duracaoMin: 90 },
  { id: 'acompanhamento-mensal', nome: 'Acompanhamento mensal', duracaoMin: 45 },
  { id: 'reuniao-alinhamento', nome: 'Reunião de alinhamento', duracaoMin: 60 },
  { id: 'planejamento-campanha', nome: 'Planejamento de campanha', duracaoMin: 75 },
  { id: 'checkup-performance', nome: 'Check-up de performance', duracaoMin: 30 },
  { id: 'ajuste-campanha', nome: 'Ajuste de campanha', duracaoMin: 45 },
  { id: 'kickoff-projeto', nome: 'Kickoff de projeto', duracaoMin: 90 },
];

const DIAS_UTEIS = [1, 2, 3, 4, 5] as const;

export const profissionaisDemo: readonly Profissional[] = [
  {
    id: 'pro-marina',
    nome: 'Marina Costa',
    servicosIds: ['consulta-design', 'acompanhamento-mensal', 'ajuste-campanha', 'reuniao-alinhamento'],
    expediente: { inicio: '08:00', fim: '17:00', diasSemana: DIAS_UTEIS },
  },
  {
    id: 'pro-lucas',
    nome: 'Lucas Martins',
    servicosIds: ['revisao-site', 'planejamento-campanha', 'kickoff-projeto', 'reuniao-alinhamento'],
    expediente: { inicio: '08:00', fim: '18:00', diasSemana: DIAS_UTEIS },
  },
  {
    id: 'pro-rafael',
    nome: 'Rafael Santos',
    servicosIds: ['reuniao-alinhamento', 'checkup-performance', 'acompanhamento-mensal', 'ajuste-campanha'],
    expediente: { inicio: '09:00', fim: '18:00', diasSemana: DIAS_UTEIS },
  },
];

export const catalogosDemo: Catalogos = {
  clientes: clientesDemo,
  profissionais: profissionaisDemo,
  servicos: servicosDemo,
};

type LinhaBase = readonly [
  clienteId: string,
  servicoId: string,
  status: StatusAgendamento,
  profissionalId: string,
  data: string,
  hora: string,
];

/** As 8 linhas visíveis no Figma (ordem: da mais recente para a mais antiga). */
const LINHAS_FIGMA: readonly LinhaBase[] = [
  ['cli-01', 'consulta-design', 'confirmado', 'pro-marina', '2026-11-04', '09:30'],
  ['cli-02', 'revisao-site', 'confirmado', 'pro-lucas', '2026-11-03', '11:00'],
  ['cli-03', 'acompanhamento-mensal', 'aguardando', 'pro-marina', '2026-11-03', '14:00'],
  ['cli-04', 'reuniao-alinhamento', 'confirmado', 'pro-rafael', '2026-11-02', '10:00'],
  ['cli-05', 'planejamento-campanha', 'confirmado', 'pro-lucas', '2026-11-01', '08:30'],
  ['cli-06', 'checkup-performance', 'cancelado', 'pro-rafael', '2026-10-30', '16:00'],
  ['cli-07', 'ajuste-campanha', 'aguardando', 'pro-marina', '2026-10-29', '13:30'],
  ['cli-08', 'kickoff-projeto', 'confirmado', 'pro-lucas', '2026-10-28', '09:00'],
];

const TOTAL_DEMO = 128;
const RESTANTES: ReadonlyArray<readonly [StatusAgendamento, number]> = [
  ['confirmado', 91],
  ['aguardando', 18],
  ['cancelado', 11],
];

/** Gerador pseudoaleatório determinístico (os mesmos dados a cada carregamento). */
function criarGerador(semente: number): () => number {
  let estado = semente >>> 0;
  return () => {
    estado = (Math.imul(estado, 1664525) + 1013904223) >>> 0;
    return estado / 4294967296;
  };
}

function escolher<T>(lista: readonly T[], sorteio: number): T {
  return lista[Math.min(lista.length - 1, Math.floor(sorteio * lista.length))] as T;
}

function embaralhar<T>(lista: readonly T[], aleatorio: () => number): T[] {
  const r = lista.slice();
  for (let i = r.length - 1; i > 0; i -= 1) {
    const j = Math.floor(aleatorio() * (i + 1));
    const tmp = r[i] as T;
    r[i] = r[j] as T;
    r[j] = tmp;
  }
  return r;
}

export function criarAgendamentosDemo(): Agendamento[] {
  const duracaoDe = (servicoId: string): number =>
    servicosDemo.find((s) => s.id === servicoId)?.duracaoMin ?? 60;

  const todos: Agendamento[] = LINHAS_FIGMA.map(
    ([clienteId, servicoId, status, profissionalId, data, hora], i) => ({
      id: `base-${i}`,
      clienteId,
      profissionalId,
      servicoId,
      data,
      hora,
      duracaoMin: duracaoDe(servicoId),
      status,
    }),
  );

  const aleatorio = criarGerador(20261104);
  const gerados: Agendamento[] = [];
  let dia = deIsoData('2026-10-27');

  for (let guarda = 0; todos.length < TOTAL_DEMO && guarda < 400; guarda += 1, dia = somarDias(dia, -1)) {
    if (dia.getDay() === 0 || dia.getDay() === 6) continue;
    const meta = 2 + Math.floor(aleatorio() * 3);
    let colocados = 0;
    for (let tentativa = 0; tentativa < 40 && colocados < meta && todos.length < TOTAL_DEMO; tentativa += 1) {
      const profissional = escolher(profissionaisDemo, aleatorio());
      const servicoId = escolher(profissional.servicosIds, aleatorio());
      const cliente = escolher(clientesDemo, aleatorio());
      const duracao = duracaoDe(servicoId);
      const inicioExp = horaParaMin(profissional.expediente.inicio);
      const fimExp = horaParaMin(profissional.expediente.fim);
      const opcoes = Math.floor((fimExp - inicioExp - duracao) / PASSO_AGENDA_MIN) + 1;
      const inicioMin = inicioExp + PASSO_AGENDA_MIN * Math.floor(aleatorio() * opcoes);
      const data = paraIsoData(dia);
      const conflito = encontrarConflitos(todos, {
        profissionalId: profissional.id,
        clienteId: cliente.id,
        data,
        inicioMin,
        fimMin: inicioMin + duracao,
      });
      if (conflito.profissional || conflito.cliente) continue;
      const hora = `${String(Math.floor(inicioMin / 60)).padStart(2, '0')}:${String(inicioMin % 60).padStart(2, '0')}`;
      const novo: Agendamento = {
        id: `gerado-${gerados.length}`,
        clienteId: cliente.id,
        profissionalId: profissional.id,
        servicoId,
        data,
        hora,
        duracaoMin: duracao,
        status: 'confirmado',
      };
      todos.push(novo);
      gerados.push(novo);
      colocados += 1;
    }
  }

  // Distribui os status restantes de forma embaralhada (mas sempre igual).
  const statusSorteados = embaralhar(
    RESTANTES.flatMap(([status, quantidade]) => Array.from({ length: quantidade }, () => status)),
    aleatorio,
  );
  gerados.forEach((ag, i) => {
    ag.status = statusSorteados[i] ?? 'confirmado';
  });

  return todos
    .slice()
    .sort((a, b) => (`${a.data}T${a.hora}` < `${b.data}T${b.hora}` ? -1 : 1))
    .map((ag, i) => ({ ...ag, id: `ag-${String(i + 1).padStart(3, '0')}` }));
}