import type { AgendamentoDetalhado } from '../../agendamentos/types';
import { DIAS_SEMANA_CURTOS, formatarDataExtensa, mesmoDia, paraIsoData, rotuloMes } from '../../agendamentos/utils/datas';
import { ChipMes } from './EventosCalendario';

const MAX_EVENTOS_POR_DIA = 3;

interface Props {
  dias: readonly Date[];
  dataRef: Date;
  hoje: Date;
  eventosPorDia: ReadonlyMap<string, AgendamentoDetalhado[]>;
  idDestacado: string | null;
  aoAbrirDia: (dia: Date) => void;
  aoAbrirEvento: (id: string) => void;
}

/** Visão mensal: 6 semanas, até 3 eventos por dia e "+N mais" que abre o dia. */
export function VisaoMes({ dias, dataRef, hoje, eventosPorDia, idDestacado, aoAbrirDia, aoAbrirEvento }: Props) {
  const semanas: Date[][] = [];
  for (let i = 0; i < dias.length; i += 7) semanas.push(dias.slice(i, i + 7));

  return (
    <div className="cal-mes" role="grid" aria-label={`Calendário de ${rotuloMes(dataRef)}`}>
      <div className="cal-mes-semana cal-mes-cabecalho" role="row">
        {DIAS_SEMANA_CURTOS.map((nome) => (
          <div key={nome} role="columnheader" className="cal-mes-titulo">{nome}</div>
        ))}
      </div>
      {semanas.map((semana) => (
        <div key={paraIsoData(semana[0] ?? dataRef)} className="cal-mes-semana" role="row">
          {semana.map((dia) => {
            const iso = paraIsoData(dia);
            const eventos = eventosPorDia.get(iso) ?? [];
            const visiveis = eventos.slice(0, MAX_EVENTOS_POR_DIA);
            const restantes = eventos.length - visiveis.length;
            const foraDoMes = dia.getMonth() !== dataRef.getMonth();
            const ehHoje = mesmoDia(dia, hoje);
            return (
              <div
                key={iso}
                role="gridcell"
                className={`cal-mes-dia${foraDoMes ? ' cal-mes-dia--fora' : ''}${ehHoje ? ' cal-mes-dia--hoje' : ''}`}
              >
                <button
                  type="button"
                  className="cal-mes-numero"
                  aria-label={`${formatarDataExtensa(iso)}${eventos.length ? `, ${eventos.length} ${eventos.length === 1 ? 'agendamento' : 'agendamentos'}` : ''}. Abrir o dia`}
                  aria-current={ehHoje ? 'date' : undefined}
                  onClick={() => aoAbrirDia(dia)}
                >
                  {dia.getDate()}
                </button>
                {eventos.length > 0 && (
                  <ul className="cal-mes-eventos">
                    {visiveis.map((ag) => (
                      <li key={ag.id}>
                        <ChipMes ag={ag} destacado={idDestacado === ag.id} aoAbrir={aoAbrirEvento} />
                      </li>
                    ))}
                  </ul>
                )}
                {restantes > 0 && (
                  <button type="button" className="cal-mes-mais" onClick={() => aoAbrirDia(dia)}>
                    +{restantes} mais
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}