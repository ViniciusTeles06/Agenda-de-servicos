import type { MouseEvent as EventoMouse } from 'react';
import type { AgendamentoDetalhado } from '../../agendamentos/types';
import {
  DIAS_SEMANA_CURTOS,
  combinarDataHora,
  formatarDataExtensa,
  mesmoDia,
  minParaHora,
  paraIsoData,
} from '../../agendamentos/utils/datas';
import {
  ALTURA_HORA_PX,
  PASSO_CLIQUE_MIN,
  PX_POR_MINUTO,
  posicionarEventos,
} from '../utils/calendario';
import { BlocoHorario } from './EventosCalendario';

interface Props {
  dias: readonly Date[];
  hoje: Date;
  eventosPorDia: ReadonlyMap<string, AgendamentoDetalhado[]>;
  faixa: { inicioMin: number; fimMin: number };
  idDestacado: string | null;
  vazio: boolean;
  aoAbrirEvento: (id: string) => void;
  aoCriarNoHorario: (data: string, hora: string) => void;
  aoHorarioPassado: () => void;
}

/** Fica fora do componente para o Date.now() não rodar durante a renderização. */
function jaPassou(iso: string, hora: string): boolean {
  return combinarDataHora(iso, hora).getTime() < Date.now();
}

/** Grade de horários das visões semanal (7 colunas) e diária (1 coluna). */
export function GradeHorarios({
  dias,
  hoje,
  eventosPorDia,
  faixa,
  idDestacado,
  vazio,
  aoAbrirEvento,
  aoCriarNoHorario,
  aoHorarioPassado,
}: Props) {
  const horas: number[] = [];
  for (let m = faixa.inicioMin; m < faixa.fimMin; m += 60) horas.push(m);
  const alturaTotal = (faixa.fimMin - faixa.inicioMin) * PX_POR_MINUTO;
  const colunasGrade = `56px repeat(${dias.length}, minmax(0, 1fr))`;

  function aoClicarColuna(e: EventoMouse<HTMLDivElement>, iso: string) {
    // Clique em um evento não cria outro.
    if (e.target !== e.currentTarget) return;
    const topo = e.currentTarget.getBoundingClientRect().top;
    const passos = Math.floor((e.clientY - topo) / PX_POR_MINUTO / PASSO_CLIQUE_MIN);
    const minutos = faixa.inicioMin + passos * PASSO_CLIQUE_MIN;
    const limitado = Math.max(faixa.inicioMin, Math.min(minutos, faixa.fimMin - PASSO_CLIQUE_MIN));
    const hora = minParaHora(limitado);
    if (jaPassou(iso, hora)) aoHorarioPassado();
    else aoCriarNoHorario(iso, hora);
  }

  return (
    <div className="cal-grade-rolagem">
      <div className={`cal-grade${dias.length > 1 ? ' cal-grade--semana' : ''}`}>
        <div className="cal-grade-topo" style={{ gridTemplateColumns: colunasGrade }}>
          <div className="cal-grade-canto" />
          {dias.map((dia) => {
            const ehHoje = mesmoDia(dia, hoje);
            return (
              <div
                key={paraIsoData(dia)}
                className={`cal-grade-titulo${ehHoje ? ' cal-grade-titulo--hoje' : ''}`}
              >
                <span className="cal-grade-semana">{DIAS_SEMANA_CURTOS[dia.getDay()]}</span>
                <span className="cal-grade-numero" aria-current={ehHoje ? 'date' : undefined}>
                  {dia.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        <div className="cal-grade-corpo" style={{ gridTemplateColumns: colunasGrade }}>
          <div className="cal-grade-horas" style={{ height: alturaTotal }} aria-hidden="true">
            {horas.map((m, i) => (
              <span
                key={m}
                className={`cal-grade-hora${i === 0 ? ' cal-grade-hora--primeira' : ''}`}
                style={{ top: (m - faixa.inicioMin) * PX_POR_MINUTO }}
              >
                {minParaHora(m)}
              </span>
            ))}
          </div>
          {dias.map((dia) => {
            const iso = paraIsoData(dia);
            const posicionados = posicionarEventos(eventosPorDia.get(iso) ?? []);
            const ehHoje = mesmoDia(dia, hoje);
            return (
              <div
                key={iso}
                role="presentation"
                className={`cal-grade-coluna${ehHoje ? ' cal-grade-coluna--hoje' : ''}`}
                style={{ height: alturaTotal, backgroundSize: `100% ${ALTURA_HORA_PX}px` }}
                data-data={iso}
                onClick={(e) => aoClicarColuna(e, iso)}
              >
                <span className="agd-sr-only">{formatarDataExtensa(iso)}</span>
                {posicionados.map((p) => (
                  <BlocoHorario
                    key={p.agendamento.id}
                    posicionado={p}
                    inicioFaixaMin={faixa.inicioMin}
                    destacado={idDestacado === p.agendamento.id}
                    aoAbrir={aoAbrirEvento}
                  />
                ))}
              </div>
            );
          })}
          {vazio && <p className="cal-grade-vazio">Nenhum agendamento neste período.</p>}
        </div>
      </div>
    </div>
  );
}