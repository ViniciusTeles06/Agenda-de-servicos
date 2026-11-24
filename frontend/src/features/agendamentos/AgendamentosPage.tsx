import { useEffect, useMemo, useState } from 'react';
import { AbasStatus } from './components/AbasStatus';
import { BarraFerramentas } from './components/BarraFerramentas';
import { BarraSelecao } from './components/BarraSelecao';
import { EstadoVazio } from './components/EstadoVazio';
import { IconeDownload, IconeMais } from './components/Icones';
import { ListaAgendamentos } from './components/ListaAgendamentos';
import { OverlaysAgendamento } from './components/OverlaysAgendamento';
import { Paginacao } from './components/Paginacao';
import { COLUNAS_PADRAO, LINHAS_POR_PAGINA_PADRAO } from './constants';
import { useAgendamentosDetalhados, useCatalogos } from './hooks/useAgendamentos';
import { useControleAgendamentos } from './hooks/useControleAgendamentos';
import { agendamentosStore } from './store/agendamentosStore';
import './styles/base.css';
import './styles/agendamentos.css';
import type { ColunaOpcional, DirecaoOrdenacao } from './types';
import { Button, Card, PageHeader } from './uiBase';
import { baixarCsv, gerarCsvAgenda, nomeArquivoAgenda } from './utils/exportarCsv';
import {
  FILTROS_INICIAIS,
  contarFiltrosAdicionais,
  contarPorStatus,
  filtrarAgendamentos,
  ordenarPorDataHora,
  paginar,
} from './utils/filtros';
import type { FiltrosLista } from './utils/filtros';

const ID_PAINEL = 'agd-painel-lista';

/**
 * Tela "Agendamentos": abas por status, busca, filtros, tabela (cartões em telas menores),
 * paginação, ações por linha e em lote, exportação e fluxo de novo agendamento.
 * Todos os dados vêm do store em memória compartilhado com o Calendário.
 */
export function AgendamentosPage() {
  const detalhados = useAgendamentosDetalhados();
  const catalogos = useCatalogos();

  const [filtros, setFiltros] = useState<FiltrosLista>(FILTROS_INICIAIS);
  const [direcao, setDirecao] = useState<DirecaoOrdenacao>('desc');
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(LINHAS_POR_PAGINA_PADRAO);
  const [colunas, setColunas] = useState<Record<ColunaOpcional, boolean>>({ ...COLUNAS_PADRAO });
  const [selecionados, setSelecionados] = useState<ReadonlySet<string>>(new Set());
  const [idDestacado, setIdDestacado] = useState<string | null>(null);

  const controle = useControleAgendamentos({
    // Novo registro: limpa filtros e vai direto para a página em que ele aparece.
    aoCriar: (agendamento) => {
      const todos = ordenarPorDataHora(agendamentosStore.obterEstado().detalhados, 'desc');
      const indice = todos.findIndex((a) => a.id === agendamento.id);
      setFiltros(FILTROS_INICIAIS);
      setDirecao('desc');
      setSelecionados(new Set());
      setPagina(indice >= 0 ? Math.floor(indice / porPagina) + 1 : 1);
      setIdDestacado(agendamento.id);
    },
    aoCancelar: () => setSelecionados(new Set()),
  });

  // As contagens das abas respeitam busca e filtros (menos o próprio status).
  const semStatus = useMemo(() => filtrarAgendamentos(detalhados, filtros, { ignorarStatus: true }), [detalhados, filtros]);
  const contagens = useMemo(() => contarPorStatus(semStatus), [semStatus]);
  const ordenados = useMemo(
    () => ordenarPorDataHora(filtros.status === 'todos' ? semStatus : semStatus.filter((a) => a.status === filtros.status), direcao),
    [semStatus, filtros.status, direcao],
  );
  const pag = paginar(ordenados, pagina, porPagina);
  const idsSelecionados = pag.itens.filter((i) => selecionados.has(i.id)).map((i) => i.id);
  const filtrosAdicionais = contarFiltrosAdicionais(filtros);
  const haFiltros = filtros.status !== 'todos' || filtros.busca.trim() !== '' || filtros.profissionalId !== 'todos' || filtrosAdicionais > 0;

  // A lista pode encolher (filtro, cancelamento na aba "Confirmados"...): mantém a página dentro do limite.
  if (pag.paginaAtual !== pagina) setPagina(pag.paginaAtual);

  useEffect(() => {
    if (!idDestacado) return undefined;
    const alvo = Array.from(document.querySelectorAll<HTMLElement>('.agd-linha--destaque')).find((el) => el.getClientRects().length > 0);
    alvo?.scrollIntoView({ block: 'nearest' });
    const timer = window.setTimeout(() => setIdDestacado(null), 3500);
    return () => window.clearTimeout(timer);
  }, [idDestacado, pag.paginaAtual]);

  const atualizarFiltros = (parcial: Partial<FiltrosLista>) => {
    setFiltros((atual) => ({ ...atual, ...parcial }));
    setPagina(1);
    setSelecionados(new Set());
  };

  const alternarSelecao = (id: string) =>
    setSelecionados((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });

  const alternarTodos = () =>
    setSelecionados((atual) => {
      const proximo = new Set(atual);
      const todosMarcados = pag.itens.length > 0 && pag.itens.every((i) => atual.has(i.id));
      pag.itens.forEach((i) => (todosMarcados ? proximo.delete(i.id) : proximo.add(i.id)));
      return proximo;
    });

  const exportar = () => {
    if (ordenados.length === 0) {
      controle.notificar('info', 'Não há agendamentos para exportar com a busca e os filtros atuais.');
      return;
    }
    baixarCsv(nomeArquivoAgenda(), gerarCsvAgenda(ordenados));
    controle.notificar('sucesso', `Agenda exportada em CSV com ${ordenados.length} ${ordenados.length === 1 ? 'agendamento' : 'agendamentos'}.`);
  };

  return (
    <div className="agd-root agd-pagina">

      <PageHeader
        title="Agendamentos"
        description="Gerencie horários, serviços e responsáveis por cada atendimento."
        actions={
          <>
            <Button onClick={exportar}>
              <span className="agd-btn-conteudo"><IconeDownload />Exportar agenda</span>
            </Button>
            <Button onClick={() => controle.abrirNovo()}>
              <span className="agd-btn-conteudo"><IconeMais />Novo agendamento</span>
            </Button>
          </>
        }
      />

      <p className="agd-rotulo-secao">Agendamentos ativos</p>

      <Card className="agd-card">
        <AbasStatus ativa={filtros.status} contagens={contagens} idPainel={ID_PAINEL} aoSelecionar={(status) => atualizarFiltros({ status })} />
        <BarraFerramentas
          busca={filtros.busca}
          aoMudarBusca={(busca) => atualizarFiltros({ busca })}
          profissionais={catalogos.profissionais}
          profissionalId={filtros.profissionalId}
          aoMudarProfissional={(profissionalId) => atualizarFiltros({ profissionalId })}
          servicos={catalogos.servicos}
          servicoId={filtros.servicoId}
          dataDe={filtros.dataDe}
          dataAte={filtros.dataAte}
          aoMudarFiltros={atualizarFiltros}
          filtrosAtivos={filtrosAdicionais}
          aoLimparFiltros={() => atualizarFiltros({ servicoId: 'todos', dataDe: '', dataAte: '' })}
          colunas={colunas}
          aoAlternarColuna={(coluna) => setColunas((atual) => ({ ...atual, [coluna]: !atual[coluna] }))}
        />

        {idsSelecionados.length > 0 && (
          <BarraSelecao
            quantidade={idsSelecionados.length}
            aoConfirmar={() => {
              controle.confirmarEmLote(idsSelecionados);
              setSelecionados(new Set());
            }}
            aoCancelar={() => controle.solicitarCancelamento(idsSelecionados)}
            aoLimpar={() => setSelecionados(new Set())}
          />
        )}

        <div id={ID_PAINEL} role="tabpanel" aria-labelledby={`agd-aba-${filtros.status}`} className="agd-painel">
          {pag.total === 0 ? (
            detalhados.length === 0 ? (
              <EstadoVazio
                titulo="Nenhum agendamento ainda"
                descricao="Crie o primeiro agendamento para começar a organizar os atendimentos."
                acao={<Button onClick={() => controle.abrirNovo()}>Novo agendamento</Button>}
              />
            ) : (
              <EstadoVazio
                titulo="Nenhum agendamento encontrado"
                descricao="Nenhum resultado para a busca e os filtros atuais. Ajuste os critérios ou limpe tudo para ver todos os agendamentos."
                acao={haFiltros ? <Button variant="outline" onClick={() => atualizarFiltros({ ...FILTROS_INICIAIS })}>Limpar busca e filtros</Button> : undefined}
              />
            )
          ) : (
            <ListaAgendamentos
              itens={pag.itens}
              colunas={colunas}
              selecionados={selecionados}
              direcao={direcao}
              idDestacado={idDestacado}
              controle={controle}
              aoAlternarSelecao={alternarSelecao}
              aoAlternarTodos={alternarTodos}
              aoAlternarOrdenacao={() => setDirecao((d) => (d === 'desc' ? 'asc' : 'desc'))}
            />
          )}
        </div>

        <Paginacao
          pagina={pag.paginaAtual}
          totalPaginas={pag.totalPaginas}
          de={pag.de}
          ate={pag.ate}
          total={pag.total}
          porPagina={porPagina}
          aoMudarPagina={(p) => {
            setPagina(p);
            setSelecionados(new Set());
          }}
          aoMudarPorPagina={(qtd) => {
            setPorPagina(qtd);
            setPagina(1);
            setSelecionados(new Set());
          }}
        />
      </Card>

      <OverlaysAgendamento controle={controle} />
    </div>
  );
}