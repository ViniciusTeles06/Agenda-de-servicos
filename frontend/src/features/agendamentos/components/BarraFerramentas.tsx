import { useEffect, useRef } from 'react';
import { COLUNAS_OPCIONAIS } from '../constants';
import type { ColunaOpcional, Profissional, Servico } from '../types';
import { Avatar, Button, Input } from '../uiBase';
import { IconeBusca, IconeCheck, IconeChevronBaixo, IconeColunas, IconeFiltros } from './Icones';
import { aoTeclarNoMenu, usePopover } from '../hooks/usePopover';

interface Props {
  busca: string;
  aoMudarBusca: (valor: string) => void;
  profissionais: readonly Profissional[];
  profissionalId: string;
  aoMudarProfissional: (id: string) => void;
  servicos: readonly Servico[];
  servicoId: string;
  dataDe: string;
  dataAte: string;
  aoMudarFiltros: (parcial: { servicoId?: string; dataDe?: string; dataAte?: string }) => void;
  filtrosAtivos: number;
  aoLimparFiltros: () => void;
  colunas: Readonly<Record<ColunaOpcional, boolean>>;
  aoAlternarColuna: (coluna: ColunaOpcional) => void;
}

function FiltroResponsavel({ profissionais, profissionalId, aoMudarProfissional }: Pick<Props, 'profissionais' | 'profissionalId' | 'aoMudarProfissional'>) {
  const { aberto, acima, fim, alternar, fechar, raizRef, aoSairFoco } = usePopover(232);
  const painelRef = useRef<HTMLDivElement>(null);
  const selecionado = profissionais.find((p) => p.id === profissionalId);

  useEffect(() => {
    if (aberto) painelRef.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
  }, [aberto]);

  const escolher = (id: string) => {
    fechar(true);
    aoMudarProfissional(id);
  };

  return (
    <div className="agd-popover-raiz" ref={raizRef} onBlur={aoSairFoco}>
      <Button
        variant="outline"
        className={selecionado ? 'agd-btn-ativo' : undefined}
        aria-haspopup="menu"
        aria-expanded={aberto}
        onClick={alternar}
      >
        <span className="agd-btn-conteudo">
          <IconeChevronBaixo />
          {selecionado ? selecionado.nome : 'Responsável'}
        </span>
      </Button>
      {aberto && (
        <div ref={painelRef} className={`agd-popover agd-popover--menu${fim ? ' agd-popover--fim' : ''}${acima ? ' agd-popover--acima' : ''}`} role="menu" aria-label="Filtrar por responsável" onKeyDown={aoTeclarNoMenu}>
          <button type="button" role="menuitemradio" aria-checked={profissionalId === 'todos'} className="agd-menu-item" onClick={() => escolher('todos')}>
            <span className="agd-menu-item-texto">Todos os responsáveis</span>
            {profissionalId === 'todos' && <IconeCheck tamanho={14} />}
          </button>
          {profissionais.map((p) => (
            <button key={p.id} type="button" role="menuitemradio" aria-checked={profissionalId === p.id} className="agd-menu-item" onClick={() => escolher(p.id)}>
              <Avatar name={p.nome} size="sm" />
              <span className="agd-menu-item-texto">{p.nome}</span>
              {profissionalId === p.id && <IconeCheck tamanho={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PainelFiltros({ servicos, servicoId, dataDe, dataAte, aoMudarFiltros, filtrosAtivos, aoLimparFiltros }: Pick<Props, 'servicos' | 'servicoId' | 'dataDe' | 'dataAte' | 'aoMudarFiltros' | 'filtrosAtivos' | 'aoLimparFiltros'>) {
  const { aberto, acima, fim, alternar, fechar, raizRef, aoSairFoco } = usePopover(320);
  const periodoInvalido = dataDe !== '' && dataAte !== '' && dataDe > dataAte;

  return (
    <div className="agd-popover-raiz" ref={raizRef} onBlur={aoSairFoco}>
      <Button
        variant="outline"
        className={filtrosAtivos > 0 ? 'agd-btn-ativo' : undefined}
        aria-haspopup="dialog"
        aria-expanded={aberto}
        onClick={alternar}
      >
        <span className="agd-btn-conteudo">
          <IconeFiltros />
          Filtros
          {filtrosAtivos > 0 && <span className="agd-contagem agd-contagem--ativa" aria-label={`${filtrosAtivos} filtros ativos`}>{filtrosAtivos}</span>}
        </span>
      </Button>
      {aberto && (
        <div className={`agd-popover agd-popover--filtros${fim ? ' agd-popover--fim' : ''}${acima ? ' agd-popover--acima' : ''}`} role="dialog" aria-label="Filtros adicionais">
          <div className="agd-campo-compacto">
            <label htmlFor="agd-filtro-servico">Serviço</label>
            <select id="agd-filtro-servico" className="agd-select" value={servicoId} onChange={(e) => aoMudarFiltros({ servicoId: e.target.value })}>
              <option value="todos">Todos os serviços</option>
              {servicos.map((s) => (
                <option key={s.id} value={s.id}>{s.nome}</option>
              ))}
            </select>
          </div>
          <div className="agd-par-datas">
            <div className="agd-campo-compacto">
              <label htmlFor="agd-filtro-de">De</label>
              <Input id="agd-filtro-de" type="date" value={dataDe} max={dataAte || undefined} onChange={(e) => aoMudarFiltros({ dataDe: e.target.value })} />
            </div>
            <div className="agd-campo-compacto">
              <label htmlFor="agd-filtro-ate">Até</label>
              <Input id="agd-filtro-ate" type="date" value={dataAte} min={dataDe || undefined} onChange={(e) => aoMudarFiltros({ dataAte: e.target.value })} />
            </div>
          </div>
          {periodoInvalido && (
            <p className="agd-erro-texto" role="alert">A data inicial precisa ser anterior ou igual à data final.</p>
          )}
          <div className="agd-popover-rodape">
            <Button variant="ghost" size="sm" disabled={filtrosAtivos === 0} onClick={aoLimparFiltros}>Limpar filtros</Button>
            <Button size="sm" onClick={() => fechar(true)}>Concluir</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function PainelColunas({ colunas, aoAlternarColuna }: Pick<Props, 'colunas' | 'aoAlternarColuna'>) {
  const { aberto, acima, alternar, raizRef, aoSairFoco } = usePopover();
  return (
    <div className="agd-popover-raiz agd-colunas" ref={raizRef} onBlur={aoSairFoco}>
      <Button variant="outline" aria-haspopup="dialog" aria-expanded={aberto} onClick={alternar}>
        <span className="agd-btn-conteudo">
          <IconeColunas />
          Colunas
        </span>
      </Button>
      {aberto && (
        <div className={`agd-popover agd-popover--fim agd-popover--menu${acima ? ' agd-popover--acima' : ''}`} role="dialog" aria-label="Escolher colunas visíveis">
          <p className="agd-popover-titulo">Colunas visíveis</p>
          {COLUNAS_OPCIONAIS.map((coluna) => (
            <label key={coluna.id} className="agd-opcao-check">
              <input type="checkbox" className="agd-checkbox" checked={colunas[coluna.id]} onChange={() => aoAlternarColuna(coluna.id)} />
              <span>{coluna.rotulo}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export function BarraFerramentas(props: Props) {
  return (
    <div className="agd-ferramentas" role="search" aria-label="Buscar e filtrar agendamentos">
      <div className="agd-busca">
        <IconeBusca className="agd-busca-icone" />
        <Input
          type="search"
          value={props.busca}
          onChange={(e) => props.aoMudarBusca(e.target.value)}
          placeholder="Buscar por cliente, serviço ou data"
          aria-label="Buscar por cliente, serviço ou data"
          autoComplete="off"
        />
      </div>
      <FiltroResponsavel profissionais={props.profissionais} profissionalId={props.profissionalId} aoMudarProfissional={props.aoMudarProfissional} />
      <PainelFiltros
        servicos={props.servicos}
        servicoId={props.servicoId}
        dataDe={props.dataDe}
        dataAte={props.dataAte}
        aoMudarFiltros={props.aoMudarFiltros}
        filtrosAtivos={props.filtrosAtivos}
        aoLimparFiltros={props.aoLimparFiltros}
      />
      <PainelColunas colunas={props.colunas} aoAlternarColuna={props.aoAlternarColuna} />
    </div>
  );
}