import { useEffect, useMemo, useState } from 'react';
import { IconeMais } from '../agendamentos/components/Icones';
import { OverlaysAgendamento } from '../agendamentos/components/OverlaysAgendamento';
import { useAgendamentosDetalhados, useCatalogos } from '../agendamentos/hooks/useAgendamentos';
import { useControleAgendamentos } from '../agendamentos/hooks/useControleAgendamentos';
import '../agendamentos/styles/base.css';
import type { StatusAgendamento } from '../agendamentos/types';
import { Button, Card, PageHeader } from '../agendamentos/uiBase';
import { deIsoData, paraIsoData } from '../agendamentos/utils/datas';
import { contarPorStatus } from '../agendamentos/utils/filtros';
import { BarraCalendario } from './components/BarraCalendario';
import { GradeHorarios } from './components/GradeHorarios';
import { VisaoMes } from './components/VisaoMes';
import './styles/calendario.css';
import {
  agruparPorDia,
  calcularFaixaHoras,
  diasDaVisao,
  escolherDataInicial,
  limitesDoPeriodo,
  navegar,
  tituloDaVisao,
} from './utils/calendario';
import type { VisaoCalendario } from './utils/calendario';

const TODOS_VISIVEIS: Record<StatusAgendamento, boolean> = { confirmado: true, aguardando: true, cancelado: true };

/**
 * Tela "Calendário": visões mensal, semanal e diária dos mesmos agendamentos da tela de Agendamentos
 * (dados compartilhados em memória). Clique em um evento para ver detalhes e em um horário livre
 * (visões semanal/diária) para criar um agendamento naquele horário.
 */
export function CalendarioPage() {
  const detalhados = useAgendamentosDetalhados();
  const catalogos = useCatalogos();
  const [hoje] = useState(() => new Date());

  const [visao, setVisao] = useState<VisaoCalendario>('mes');
  const [dataRef, setDataRef] = useState<Date>(() => escolherDataInicial(detalhados, new Date()));
  const [profissionalId, setProfissionalId] = useState('todos');
  const [statusVisiveis, setStatusVisiveis] = useState<Record<StatusAgendamento, boolean>>(TODOS_VISIVEIS);
  const [idDestacado, setIdDestacado] = useState<string | null>(null);

  const controle = useControleAgendamentos({
    // Novo registro: leva o calendário até o dia dele e garante que ele esteja visível.
    aoCriar: (agendamento) => {
      setDataRef(deIsoData(agendamento.data));
      setStatusVisiveis((atual) => ({ ...atual, [agendamento.status]: true }));
      setProfissionalId((atual) => (atual === 'todos' || atual === agendamento.profissionalId ? atual : 'todos'));
      setIdDestacado(agendamento.id);
    },
  });

  useEffect(() => {
    if (!idDestacado) return undefined;
    const timer = window.setTimeout(() => setIdDestacado(null), 3500);
    return () => window.clearTimeout(timer);
  }, [idDestacado]);

  const dias = useMemo(() => diasDaVisao(visao, dataRef), [visao, dataRef]);
  const limites = useMemo(() => limitesDoPeriodo(visao, dataRef), [visao, dataRef]);

  const doResponsavel = useMemo(
    () => (profissionalId === 'todos' ? detalhados : detalhados.filter((a) => a.profissionalId === profissionalId)),
    [detalhados, profissionalId],
  );
  const daGrade = useMemo(() => {
    const primeiro = paraIsoData(dias[0] ?? dataRef);
    const ultimo = paraIsoData(dias[dias.length - 1] ?? dataRef);
    return doResponsavel.filter((a) => a.data >= primeiro && a.data <= ultimo && statusVisiveis[a.status]);
  }, [doResponsavel, dias, dataRef, statusVisiveis]);
  const eventosPorDia = useMemo(() => agruparPorDia(daGrade), [daGrade]);
  const faixa = useMemo(() => calcularFaixaHoras(daGrade), [daGrade]);

  // Contagens e resumo falam do período principal (o mês, a semana ou o dia), não dos dias vizinhos.
  const doPeriodo = useMemo(
    () => doResponsavel.filter((a) => a.data >= limites.de && a.data <= limites.ate),
    [doResponsavel, limites],
  );
  const contagens = contarPorStatus(doPeriodo);
  const totalVisivel = doPeriodo.filter((a) => statusVisiveis[a.status]).length;
  const resumo =
    totalVisivel === 0
      ? 'Nenhum agendamento neste período.'
      : `${totalVisivel} ${totalVisivel === 1 ? 'agendamento' : 'agendamentos'} neste período`;

  const abrirNovo = (prefill: { data?: string; hora?: string } = {}) =>
    controle.abrirNovo({ ...prefill, ...(profissionalId !== 'todos' ? { profissionalId } : {}) });

  return (
    <div className="agd-root agd-pagina">

      <PageHeader
        title="Calendário"
        description="Veja os atendimentos por mês, semana ou dia. Clique em um horário livre para agendar."
        actions={
          <Button onClick={() => abrirNovo()}>
            <span className="agd-btn-conteudo"><IconeMais />Novo agendamento</span>
          </Button>
        }
      />

      <Card className="agd-card cal-card">
        <BarraCalendario
          visao={visao}
          aoMudarVisao={setVisao}
          titulo={tituloDaVisao(visao, dataRef)}
          aoAnterior={() => setDataRef((d) => navegar(visao, d, -1))}
          aoProximo={() => setDataRef((d) => navegar(visao, d, 1))}
          aoHoje={() => setDataRef(new Date())}
          profissionais={catalogos.profissionais}
          profissionalId={profissionalId}
          aoMudarProfissional={setProfissionalId}
          contagens={contagens}
          statusVisiveis={statusVisiveis}
          aoAlternarStatus={(status) => setStatusVisiveis((atual) => ({ ...atual, [status]: !atual[status] }))}
          resumo={resumo}
        />
        <div className="cal-corpo">
          {visao === 'mes' ? (
            <VisaoMes
              dias={dias}
              dataRef={dataRef}
              hoje={hoje}
              eventosPorDia={eventosPorDia}
              idDestacado={idDestacado}
              aoAbrirDia={(dia) => {
                setDataRef(dia);
                setVisao('dia');
              }}
              aoAbrirEvento={controle.abrirDetalhes}
            />
          ) : (
            <GradeHorarios
              dias={dias}
              hoje={hoje}
              eventosPorDia={eventosPorDia}
              faixa={faixa}
              idDestacado={idDestacado}
              vazio={daGrade.length === 0}
              aoAbrirEvento={controle.abrirDetalhes}
              aoCriarNoHorario={(data, hora) => abrirNovo({ data, hora })}
              aoHorarioPassado={() => controle.notificar('info', 'Esse horário já passou. Escolha um horário a partir de agora.')}
            />
          )}
        </div>
      </Card>

      <OverlaysAgendamento controle={controle} />
    </div>
  );
}