import { IconeCheck, IconeFechar, IconeRelogio } from '../../agendamentos/components/Icones';
import type { AgendamentoDetalhado, StatusAgendamento } from '../../agendamentos/types';
import { PX_POR_MINUTO, descreverAgendamento } from '../utils/calendario';
import type { EventoPosicionado } from '../utils/calendario';

/** Ícone por status: a cor nunca é a única pista (cancelado também vem riscado). */
export function IconeStatus({ status, tamanho = 12 }: { status: StatusAgendamento; tamanho?: number }) {
  if (status === 'confirmado') return <IconeCheck tamanho={tamanho} />;
  if (status === 'aguardando') return <IconeRelogio tamanho={tamanho} />;
  return <IconeFechar tamanho={tamanho} />;
}

interface PropsChip {
  ag: AgendamentoDetalhado;
  destacado: boolean;
  aoAbrir: (id: string) => void;
}

/** Evento compacto da visão mensal. */
export function ChipMes({ ag, destacado, aoAbrir }: PropsChip) {
  return (
    <button
      type="button"
      className={`cal-chip cal-chip--${ag.status}${destacado ? ' cal-destaque' : ''}`}
      aria-label={descreverAgendamento(ag)}
      title={`${ag.hora} · ${ag.cliente.nome} — ${ag.servico.nome}`}
      onClick={() => aoAbrir(ag.id)}
    >
      <span className="cal-chip-icone"><IconeStatus status={ag.status} tamanho={10} /></span>
      <span className="cal-chip-hora">{ag.hora}</span>
      <span className="cal-chip-texto">{ag.cliente.nome}</span>
    </button>
  );
}

interface PropsBloco {
  posicionado: EventoPosicionado;
  inicioFaixaMin: number;
  destacado: boolean;
  aoAbrir: (id: string) => void;
}

/** Evento posicionado pelo horário nas visões semanal e diária. */
export function BlocoHorario({ posicionado, inicioFaixaMin, destacado, aoAbrir }: PropsBloco) {
  const { agendamento: ag, coluna, colunas } = posicionado;
  const altura = Math.max(ag.duracaoMin * PX_POR_MINUTO - 2, 22);
  const compacto = altura < 44;
  const detalhado = altura >= 70;
  return (
    <button
      type="button"
      className={`cal-bloco cal-bloco--${ag.status}${compacto ? ' cal-bloco--compacto' : ''}${destacado ? ' cal-destaque' : ''}`}
      style={{
        top: (ag.inicioMin - inicioFaixaMin) * PX_POR_MINUTO + 1,
        height: altura,
        left: `${(coluna / colunas) * 100}%`,
        width: `calc(${100 / colunas}% - 3px)`,
      }}
      aria-label={descreverAgendamento(ag)}
      title={`${ag.hora}–${ag.horaFim} · ${ag.cliente.nome} — ${ag.servico.nome} (${ag.profissional.nome})`}
      onClick={() => aoAbrir(ag.id)}
    >
      <span className="cal-bloco-linha">
        <IconeStatus status={ag.status} tamanho={11} />
        <span className="cal-bloco-hora">{compacto ? ag.hora : `${ag.hora}–${ag.horaFim}`}</span>
        {compacto && <span className="cal-bloco-titulo">{ag.cliente.nome}</span>}
      </span>
      {!compacto && <span className="cal-bloco-titulo">{ag.cliente.nome}</span>}
      {!compacto && <span className="cal-bloco-sub">{ag.servico.nome}</span>}
      {detalhado && <span className="cal-bloco-sub">{ag.profissional.nome}</span>}
    </button>
  );
}