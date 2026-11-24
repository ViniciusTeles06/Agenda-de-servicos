import { LINHAS_POR_PAGINA_OPCOES } from '../constants';
import { gerarPaginas } from '../utils/filtros';
import { IconeChevronDireita, IconeChevronEsquerda } from './Icones';

interface Props {
  pagina: number;
  totalPaginas: number;
  de: number;
  ate: number;
  total: number;
  porPagina: number;
  aoMudarPagina: (pagina: number) => void;
  aoMudarPorPagina: (quantidade: number) => void;
}

export function Paginacao({ pagina, totalPaginas, de, ate, total, porPagina, aoMudarPagina, aoMudarPorPagina }: Props) {
  const itens = gerarPaginas(pagina, totalPaginas);
  return (
    <div className="agd-rodape">
      <p className="agd-rodape-resumo" aria-live="polite">
        {total === 0 ? 'Nenhum agendamento para mostrar' : `Mostrando ${de}–${ate} de ${total} ${total === 1 ? 'agendamento' : 'agendamentos'}`}
      </p>
      <div className="agd-rodape-controles">
        <div className="agd-linhas-por-pagina">
          <label htmlFor="agd-linhas-por-pagina">Linhas por página</label>
          <select id="agd-linhas-por-pagina" className="agd-select agd-select--compacto" value={porPagina} onChange={(e) => aoMudarPorPagina(Number(e.target.value))}>
            {LINHAS_POR_PAGINA_OPCOES.map((qtd) => (
              <option key={qtd} value={qtd}>{qtd}</option>
            ))}
          </select>
        </div>
        <nav className="agd-paginas" aria-label="Paginação">
          <button type="button" className="agd-pagina-botao" aria-label="Página anterior" disabled={pagina <= 1} onClick={() => aoMudarPagina(pagina - 1)}>
            <IconeChevronEsquerda />
          </button>
          {itens.map((item) =>
            typeof item === 'number' ? (
              <button
                key={item}
                type="button"
                className={`agd-pagina-botao${item === pagina ? ' agd-pagina-botao--ativa' : ''}`}
                aria-label={`Página ${item}`}
                aria-current={item === pagina ? 'page' : undefined}
                onClick={() => aoMudarPagina(item)}
              >
                {item}
              </button>
            ) : (
              <span key={item} className="agd-pagina-reticencias" aria-hidden="true">…</span>
            ),
          )}
          <button type="button" className="agd-pagina-botao" aria-label="Próxima página" disabled={pagina >= totalPaginas} onClick={() => aoMudarPagina(pagina + 1)}>
            <IconeChevronDireita />
          </button>
        </nav>
      </div>
    </div>
  );
}