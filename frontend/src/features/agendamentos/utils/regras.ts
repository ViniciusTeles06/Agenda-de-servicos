/**
 * Regras de negócio da agenda (funções puras, sem React).
 * Quando houver backend, estas mesmas regras devem continuar valendo no servidor.
 */
import { PASSO_AGENDA_MIN } from '../constants';
import type {
  Agendamento,
  Catalogos,
  DadosAgendamento,
  ErrosAgendamento,
  HorarioDisponivel,
  ResultadoHorarios,
} from '../types';
import {
  combinarDataHora,
  dataValida,
  deIsoData,
  horaParaMin,
  horaValida,
  minParaHora,
  paraIsoData,
} from './datas';

/** Dois intervalos [ini, fim) se sobrepõem? Horários colados (fim = início) não conflitam. */
export function intervalosSeSobrepoem(iniA: number, fimA: number, iniB: number, fimB: number): boolean {
  return iniA < fimB && iniB < fimA;
}

export interface CandidatoAgenda {
  profissionalId: string;
  clienteId?: string | undefined;
  data: string;
  inicioMin: number;
  fimMin: number;
}

export interface ConflitosAgenda {
  profissional?: Agendamento;
  cliente?: Agendamento;
}

/**
 * Procura agendamentos ativos que colidem com o candidato.
 * Cancelados nunca bloqueiam horário. `ignorarId` serve para edição (não conflitar consigo mesmo).
 */
export function encontrarConflitos(
  agendamentos: readonly Agendamento[],
  candidato: CandidatoAgenda,
  ignorarId?: string,
): ConflitosAgenda {
  const resultado: ConflitosAgenda = {};
  for (const ag of agendamentos) {
    if (ag.id === ignorarId || ag.status === 'cancelado' || ag.data !== candidato.data) continue;
    const ini = horaParaMin(ag.hora);
    if (!intervalosSeSobrepoem(candidato.inicioMin, candidato.fimMin, ini, ini + ag.duracaoMin)) continue;
    if (!resultado.profissional && ag.profissionalId === candidato.profissionalId) {
      resultado.profissional = ag;
    }
    if (!resultado.cliente && candidato.clienteId && ag.clienteId === candidato.clienteId) {
      resultado.cliente = ag;
    }
  }
  return resultado;
}

function descreverIntervalo(ag: Agendamento): string {
  return `${ag.hora} às ${minParaHora(horaParaMin(ag.hora) + ag.duracaoMin)}`;
}

export interface ContextoRegras {
  agendamentos: readonly Agendamento[];
  catalogos: Catalogos;
  /** Relógio injetado (facilita testes). */
  agora: Date;
  /** Preenchido ao editar: o registro original. */
  original?: Agendamento | undefined;
}

/**
 * Valida os dados do formulário. Retorna um objeto vazio quando está tudo certo.
 * Garante: campos obrigatórios, coerência (profissional realiza o serviço), data/hora válidas,
 * não agendar no passado, dia/expediente do profissional e ausência de conflitos
 * (mesmo profissional ou mesmo cliente em horários sobrepostos).
 */
export function validarAgendamento(
  dados: Partial<DadosAgendamento>,
  contexto: ContextoRegras,
): ErrosAgendamento {
  const erros: ErrosAgendamento = {};
  const { catalogos, original } = contexto;

  const cliente = catalogos.clientes.find((c) => c.id === dados.clienteId);
  const profissional = catalogos.profissionais.find((p) => p.id === dados.profissionalId);
  const servico = catalogos.servicos.find((s) => s.id === dados.servicoId);

  if (!dados.clienteId) erros.clienteId = 'Selecione o cliente.';
  else if (!cliente) erros.clienteId = 'Cliente não encontrado. Selecione outro.';

  if (!dados.profissionalId) erros.profissionalId = 'Selecione o profissional.';
  else if (!profissional) erros.profissionalId = 'Profissional não encontrado. Selecione outro.';

  if (!dados.servicoId) {
    erros.servicoId = 'Selecione o serviço.';
  } else if (!servico) {
    erros.servicoId = 'Serviço não encontrado. Selecione outro.';
  } else if (profissional && !profissional.servicosIds.includes(servico.id)) {
    erros.servicoId = `${profissional.nome} não realiza “${servico.nome}”. Escolha outro serviço ou profissional.`;
  }

  if (!dados.data) erros.data = 'Escolha a data do atendimento.';
  else if (!dataValida(dados.data)) erros.data = 'Informe uma data válida.';

  if (!dados.hora) erros.hora = 'Escolha um horário disponível.';
  else if (!horaValida(dados.hora)) erros.hora = 'Horário inválido.';

  // Regras de data (independem de serviço e horário). Só valem quando data/profissional mudam:
  // registros antigos continuam editáveis sem exigir uma nova data.
  if (profissional && dados.data && !erros.data) {
    const dataAlterada =
      !original || original.profissionalId !== profissional.id || original.data !== dados.data;
    if (dataAlterada) {
      if (dados.data < paraIsoData(contexto.agora)) {
        erros.data = 'Escolha uma data a partir de hoje.';
      } else if (!profissional.expediente.diasSemana.includes(deIsoData(dados.data).getDay())) {
        erros.data = `${profissional.nome} não atende neste dia da semana.`;
      }
    }
  }

  if (
    !profissional || !servico || erros.servicoId || erros.data || erros.hora ||
    !dados.data || !dados.hora
  ) {
    return erros;
  }

  const data = dados.data;
  const hora = dados.hora;
  const inicioMin = horaParaMin(hora);
  const fimMin = inicioMin + servico.duracaoMin;

  const alterouHorario =
    !original ||
    original.profissionalId !== profissional.id ||
    original.data !== data ||
    original.hora !== hora;
  if (alterouHorario && combinarDataHora(data, hora).getTime() < contexto.agora.getTime()) {
    erros.hora = 'Esse horário já passou. Escolha um horário a partir de agora.';
    return erros;
  }

  const { inicio: expInicio, fim: expFim } = profissional.expediente;
  if (inicioMin < horaParaMin(expInicio)) {
    erros.hora = `${profissional.nome} começa a atender às ${expInicio}.`;
    return erros;
  }
  if (fimMin > horaParaMin(expFim)) {
    erros.hora = `O atendimento terminaria às ${minParaHora(fimMin)}, depois do fim do expediente (${expFim}).`;
    return erros;
  }

  const conflitos = encontrarConflitos(
    contexto.agendamentos,
    { profissionalId: profissional.id, clienteId: cliente?.id, data, inicioMin, fimMin },
    original?.id,
  );
  if (conflitos.profissional) {
    erros.hora = `${profissional.nome} já tem um atendimento das ${descreverIntervalo(conflitos.profissional)} neste dia.`;
  } else if (conflitos.cliente) {
    erros.hora = `${cliente?.nome ?? 'O cliente'} já tem outro atendimento neste horário (${descreverIntervalo(conflitos.cliente)}).`;
  }
  return erros;
}

export interface ParametrosHorarios {
  profissionalId: string;
  servicoId: string;
  data: string;
  clienteId?: string | undefined;
  agendamentos: readonly Agendamento[];
  catalogos: Catalogos;
  agora: Date;
  original?: Agendamento | undefined;
}

/**
 * Lista os horários de início possíveis (a cada PASSO_AGENDA_MIN) para o profissional/serviço/dia,
 * marcando os indisponíveis (passado, ocupado ou cliente com outro atendimento).
 */
export function listarHorarios(p: ParametrosHorarios): ResultadoHorarios {
  const profissional = p.catalogos.profissionais.find((x) => x.id === p.profissionalId);
  const servico = p.catalogos.servicos.find((x) => x.id === p.servicoId);
  if (!profissional || !servico || !dataValida(p.data)) return { horarios: [] };

  const { expediente } = profissional;
  const diaSemExpediente = !expediente.diasSemana.includes(deIsoData(p.data).getDay());
  const inicioExp = horaParaMin(expediente.inicio);
  const fimExp = horaParaMin(expediente.fim);
  const horarios: HorarioDisponivel[] = [];

  for (let m = inicioExp; m + servico.duracaoMin <= fimExp; m += PASSO_AGENDA_MIN) {
    const hora = minParaHora(m);
    // Na edição, o horário atual do registro continua selecionável.
    const ehOriginal =
      !!p.original &&
      p.original.profissionalId === profissional.id &&
      p.original.data === p.data &&
      p.original.hora === hora;

    if (!ehOriginal) {
      if (diaSemExpediente) {
        horarios.push({ hora, disponivel: false, motivo: 'Sem expediente neste dia' });
        continue;
      }
      if (combinarDataHora(p.data, hora).getTime() < p.agora.getTime()) {
        horarios.push({ hora, disponivel: false, motivo: 'Horário que já passou' });
        continue;
      }
    }

    const conflitos = encontrarConflitos(
      p.agendamentos,
      { profissionalId: profissional.id, clienteId: p.clienteId, data: p.data, inicioMin: m, fimMin: m + servico.duracaoMin },
      p.original?.id,
    );
    if (conflitos.profissional) {
      horarios.push({ hora, disponivel: false, motivo: `${profissional.nome} já está ocupado(a)` });
    } else if (conflitos.cliente) {
      horarios.push({ hora, disponivel: false, motivo: 'O cliente tem outro atendimento' });
    } else {
      horarios.push({ hora, disponivel: true });
    }
  }

  return diaSemExpediente
    ? { horarios, aviso: `${profissional.nome} não atende neste dia da semana.` }
    : { horarios };
}