import { IconeChevronDireita, IconeChevronEsquerda } from '../../agendamentos/components/Icones';
import { ABAS_STATUS, ROTULO_STATUS } from '../../agendamentos/constants';
import type { Profissional, StatusAgendamento } from '../../agendamentos/types';
import { Button } from '../../agendamentos/uiBase';
import type { VisaoCalendario } from '../utils/calendario';

const VISOES: ReadonlyArray<{ id: VisaoCalendario; rotulo: string; anterior: string; proximo: string }> = [
  { id: 'mes', rotulo: 'Mês', anterior: 'Ir para o mês anterior', proximo: 'Ir para o próximo mês' },
  { id: 'semana', rotulo: 'Semana', anterior: 'Ir para a semana anterior', proximo: 'Ir para a próxima semana' },
  { id: 'dia', rotulo: 'Dia', anterior: 'Ir para o dia anterior', proximo: 'Ir para o próximo dia' },
];

const STATUS_FILTRAVEIS = ABAS_STATUS.filter((aba) => aba.id !== 'todos').map((aba) => aba.id as StatusAgendamento);

interface Props {
  visao: VisaoCalendario;
  aoMudarVisao: (visao: VisaoCalendario) => void;
  titulo: string;
  aoAnterior: () => void;
  aoProximo: () => void;
  aoHoje: () => void;
  profissionais: readonly Profissional[];
  profissionalId: string;
  aoMudarProfissional: (id: string) => void;
  contagens: Readonly<Record<StatusAgendamento, number>>;
  statusVisiveis: Readonly<Record<StatusAgendamento, boolean>>;
  aoAlternarStatus: (status: StatusAgendamento) => void;
  resumo: string;
}

export function BarraCalendario(props: Props) {
  const atual = VISOES.find((v) => v.id === props.visao);
  return (
    <div className="cal-barra">
      <div className="cal-barra-linha">
        <div className="cal-navegacao">
          <Button variant="outline" onClick={props.aoHoje}>Hoje</Button>
          <div className="cal-setas">
            <button type="button" className="cal-seta" aria-label={atual?.anterior ?? 'Período anterior'} onClick={props.aoAnterior}>
              <IconeChevronEsquerda />
            </button>
            <button type="button" className="cal-seta" aria-label={atual?.proximo ?? 'Próximo período'} onClick={props.aoProximo}>
              <IconeChevronDireita />
            </button>
          </div>
          <h2 className="cal-titulo agd-capitalizar" aria-live="polite">{props.titulo}</h2>
        </div>
        <div className="cal-segmentos" role="group" aria-label="Tipo de visualização">
          {VISOES.map((v) => (
            <button
              key={v.id}
              type="button"
              className="cal-segmento"
              aria-pressed={props.visao === v.id}
              onClick={() => props.aoMudarVisao(v.id)}
            >
              {v.rotulo}
            </button>
          ))}
        </div>
      </div>

      <div className="cal-barra-linha cal-barra-filtros">
        <div className="cal-filtros">
          <div className="cal-campo-responsavel">
            <label className="agd-sr-only" htmlFor="cal-responsavel">Responsável</label>
            <select
              id="cal-responsavel"
              className="agd-select"
              value={props.profissionalId}
              onChange={(e) => props.aoMudarProfissional(e.target.value)}
            >
              <option value="todos">Todos os responsáveis</option>
              {props.profissionais.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
          <div className="cal-legenda" role="group" aria-label="Mostrar agendamentos por status">
            {STATUS_FILTRAVEIS.map((status) => (
              <button
                key={status}
                type="button"
                className={`cal-legenda-item cal-legenda-item--${status}`}
                aria-pressed={props.statusVisiveis[status]}
                onClick={() => props.aoAlternarStatus(status)}
              >
                <span className="cal-legenda-ponto" aria-hidden="true" />
                {ROTULO_STATUS[status]}
                <span className="agd-contagem" aria-label={`${props.contagens[status]} no período`}>{props.contagens[status]}</span>
              </button>
            ))}
          </div>
        </div>
        <p className="cal-resumo" aria-live="polite">{props.resumo}</p>
      </div>
    </div>
  );
}