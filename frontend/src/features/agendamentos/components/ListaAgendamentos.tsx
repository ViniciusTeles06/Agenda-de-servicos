import { useEffect, useRef } from 'react';
import type { ControleAgendamentos } from '../hooks/useControleAgendamentos';
import type { AgendamentoDetalhado, ColunaOpcional, DirecaoOrdenacao } from '../types';
import { formatarDataHora } from '../utils/datas';
import { Avatar, StatusBadge } from '../uiBase';
import { IconeLapis, IconeSetaBaixo, IconeSetaCima } from './Icones';
import { MenuAcoes } from './MenuAcoes';

export interface PropsLista {
  itens: readonly AgendamentoDetalhado[];
  colunas: Readonly<Record<ColunaOpcional, boolean>>;
  selecionados: ReadonlySet<string>;
  direcao: DirecaoOrdenacao;
  idDestacado: string | null;
  controle: ControleAgendamentos;
  aoAlternarSelecao: (id: string) => void;
  aoAlternarTodos: () => void;
  aoAlternarOrdenacao: () => void;
}

/* ───────── Células compartilhadas pela tabela (desktop) e pelos cartões (celular/tablet) ───────── */

function CelulaCliente({ ag }: { ag: AgendamentoDetalhado }) {
  return (
    <div className="agd-cliente">
      <Avatar name={ag.cliente.nome} size="md" />
      <div className="agd-cliente-texto">
        <span className="agd-texto-principal">{ag.cliente.nome}</span>
        <span className="agd-texto-secundario">{ag.cliente.email}</span>
      </div>
    </div>
  );
}

function CelulaServico({ ag }: { ag: AgendamentoDetalhado }) {
  return (
    <div className="agd-servico">
      <span className="agd-texto-principal agd-texto-servico">{ag.servico.nome}</span>
      <span className="agd-texto-secundario">{ag.duracaoMin} min</span>
    </div>
  );
}

function CelulaResponsavel({ ag }: { ag: AgendamentoDetalhado }) {
  return (
    <div className="agd-responsavel">
      <Avatar name={ag.profissional.nome} size="sm" />
      <span>{ag.profissional.nome}</span>
    </div>
  );
}

function CelulaData({ ag }: { ag: AgendamentoDetalhado }) {
  return <span className="agd-data">{formatarDataHora(ag.data, ag.hora)}</span>;
}

function CelulaAcoes({ ag, controle }: { ag: AgendamentoDetalhado; controle: ControleAgendamentos }) {
  return (
    <div className="agd-acoes">
      <button
        type="button"
        className="agd-icone-botao"
        aria-label={`Editar agendamento de ${ag.cliente.nome}`}
        title="Editar"
        onClick={() => controle.abrirEdicao(ag.id)}
      >
        <IconeLapis />
      </button>
      <MenuAcoes ag={ag} controle={controle} />
    </div>
  );
}

function CaixaSelecao({ ag, marcado, aoAlternar }: { ag: AgendamentoDetalhado; marcado: boolean; aoAlternar: () => void }) {
  return (
    <input
      type="checkbox"
      className="agd-checkbox"
      checked={marcado}
      onChange={aoAlternar}
      aria-label={`Selecionar agendamento de ${ag.cliente.nome}`}
    />
  );
}

function classeLinha(ag: AgendamentoDetalhado, props: PropsLista): string {
  const classes = ['agd-linha'];
  if (props.selecionados.has(ag.id)) classes.push('agd-linha--selecionada');
  if (props.idDestacado === ag.id) classes.push('agd-linha--destaque');
  return classes.join(' ');
}

/* ───────── Tabela (≥ 1024px) ───────── */

function TabelaAgendamentos(props: PropsLista) {
  const { itens, colunas, selecionados, direcao, controle } = props;
  const marcadosNaPagina = itens.filter((i) => selecionados.has(i.id)).length;
  const todos = itens.length > 0 && marcadosNaPagina === itens.length;
  const parcial = marcadosNaPagina > 0 && !todos;
  const checkCabecalho = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkCabecalho.current) checkCabecalho.current.indeterminate = parcial;
  }, [parcial]);

  const tituloOrdenacao =
    direcao === 'asc'
      ? 'Ordenado do mais antigo ao mais recente. Clique para inverter.'
      : 'Ordenado do mais recente ao mais antigo. Clique para inverter.';

  return (
    <div className="agd-tabela-wrap">
      <table className="agd-tabela">
        <caption className="agd-sr-only">Lista de agendamentos</caption>
        <thead>
          <tr>
            <th scope="col" className="agd-col-check">
              <input
                ref={checkCabecalho}
                type="checkbox"
                className="agd-checkbox"
                checked={todos}
                onChange={props.aoAlternarTodos}
                aria-label="Selecionar todos os agendamentos desta página"
              />
            </th>
            <th scope="col" className="agd-col-cliente">Cliente</th>
            {colunas.servico && <th scope="col" className="agd-col-servico">Serviço</th>}
            {colunas.status && <th scope="col" className="agd-col-status">Status</th>}
            {colunas.responsavel && <th scope="col" className="agd-col-responsavel">Responsável</th>}
            {colunas.data && (
              <th scope="col" className="agd-col-data" aria-sort={direcao === 'asc' ? 'ascending' : 'descending'}>
                <button type="button" className="agd-th-ordenar" onClick={props.aoAlternarOrdenacao} title={tituloOrdenacao}>
                  Data e horário
                  {direcao === 'asc' ? <IconeSetaCima tamanho={14} /> : <IconeSetaBaixo tamanho={14} />}
                </button>
              </th>
            )}
            <th scope="col" className="agd-col-acoes">Ações</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((ag) => (
            <tr key={ag.id} className={classeLinha(ag, props)}>
              <td className="agd-col-check">
                <CaixaSelecao ag={ag} marcado={selecionados.has(ag.id)} aoAlternar={() => props.aoAlternarSelecao(ag.id)} />
              </td>
              <td className="agd-col-cliente">
                <CelulaCliente ag={ag} />
              </td>
              {colunas.servico && (
                <td className="agd-col-servico">
                  <CelulaServico ag={ag} />
                </td>
              )}
              {colunas.status && (
                <td className="agd-col-status">
                  <StatusBadge status={ag.status} />
                </td>
              )}
              {colunas.responsavel && (
                <td className="agd-col-responsavel">
                  <CelulaResponsavel ag={ag} />
                </td>
              )}
              {colunas.data && (
                <td className="agd-col-data">
                  <CelulaData ag={ag} />
                </td>
              )}
              <td className="agd-col-acoes">
                <CelulaAcoes ag={ag} controle={controle} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ───────── Cartões (< 1024px) ───────── */

function CartoesAgendamentos(props: PropsLista) {
  const { itens, selecionados, controle } = props;
  return (
    <ul className="agd-cartoes" aria-label="Lista de agendamentos">
      {itens.map((ag) => (
        <li key={ag.id} className={`${classeLinha(ag, props)} agd-cartao`}>
          <div className="agd-cartao-topo">
            <CaixaSelecao ag={ag} marcado={selecionados.has(ag.id)} aoAlternar={() => props.aoAlternarSelecao(ag.id)} />
            <CelulaCliente ag={ag} />
            <CelulaAcoes ag={ag} controle={controle} />
          </div>
          <div className="agd-cartao-meio">
            <CelulaServico ag={ag} />
            <StatusBadge status={ag.status} />
          </div>
          <div className="agd-cartao-base">
            <CelulaResponsavel ag={ag} />
            <CelulaData ag={ag} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Renderiza as duas apresentações; o CSS mostra a tabela em telas largas e os cartões nas demais. */
export function ListaAgendamentos(props: PropsLista) {
  return (
    <>
      <TabelaAgendamentos {...props} />
      <CartoesAgendamentos {...props} />
    </>
  );
}