import type { KeyboardEvent as EventoTeclado } from 'react';
import { ABAS_STATUS } from '../constants';
import type { FiltroStatus } from '../types';

interface Props {
  ativa: FiltroStatus;
  contagens: Record<FiltroStatus, number>;
  idPainel: string;
  aoSelecionar: (status: FiltroStatus) => void;
}

/** Abas de status (padrão WAI-ARIA tabs): ←/→ trocam de aba, Home/End vão para a primeira/última. */
export function AbasStatus({ ativa, contagens, idPainel, aoSelecionar }: Props) {
  function aoTeclar(e: EventoTeclado<HTMLDivElement>) {
    const atual = ABAS_STATUS.findIndex((aba) => aba.id === ativa);
    let novo = -1;
    if (e.key === 'ArrowRight') novo = (atual + 1) % ABAS_STATUS.length;
    else if (e.key === 'ArrowLeft') novo = (atual - 1 + ABAS_STATUS.length) % ABAS_STATUS.length;
    else if (e.key === 'Home') novo = 0;
    else if (e.key === 'End') novo = ABAS_STATUS.length - 1;
    const proxima = novo >= 0 ? ABAS_STATUS[novo] : undefined;
    if (!proxima) return;
    e.preventDefault();
    aoSelecionar(proxima.id);
    document.getElementById(`agd-aba-${proxima.id}`)?.focus();
  }

  return (
    <div className="agd-abas" role="tablist" aria-label="Filtrar agendamentos por status" onKeyDown={aoTeclar}>
      {ABAS_STATUS.map((aba) => {
        const selecionada = aba.id === ativa;
        return (
          <button
            key={aba.id}
            id={`agd-aba-${aba.id}`}
            type="button"
            role="tab"
            aria-selected={selecionada}
            aria-controls={idPainel}
            tabIndex={selecionada ? 0 : -1}
            className={`agd-aba${selecionada ? ' agd-aba--ativa' : ''}`}
            onClick={() => aoSelecionar(aba.id)}
          >
            <span>{aba.rotulo}</span>
            <span className="agd-contagem" aria-label={`${contagens[aba.id]} agendamentos`}>{contagens[aba.id]}</span>
          </button>
        );
      })}
    </div>
  );
}