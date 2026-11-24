import { useEffect, useRef } from 'react';
import type { ControleAgendamentos } from '../hooks/useControleAgendamentos';
import type { AgendamentoDetalhado } from '../types';
import { IconeReticencias } from './Icones';
import { aoTeclarNoMenu, usePopover } from '../hooks/usePopover';

interface Props {
  ag: AgendamentoDetalhado;
  controle: ControleAgendamentos;
}

/** Menu "…" de cada agendamento: detalhes, editar, confirmar, cancelar ou reabrir. */
export function MenuAcoes({ ag, controle }: Props) {
  const { aberto, acima, alternar, fechar, raizRef, aoSairFoco } = usePopover();
  const painelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (aberto) painelRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [aberto]);

  // Devolve o foco ao botão antes de abrir modais, para o foco voltar a um lugar válido ao fechar.
  const executar = (acao: () => void) => () => {
    fechar(true);
    acao();
  };

  return (
    <div className="agd-popover-raiz" ref={raizRef} onBlur={aoSairFoco}>
      <button
        type="button"
        className="agd-icone-botao"
        aria-label={`Mais ações para ${ag.cliente.nome}`}
        aria-haspopup="menu"
        aria-expanded={aberto}
        title="Mais ações"
        onClick={alternar}
      >
        <IconeReticencias />
      </button>
      {aberto && (
        <div ref={painelRef} className={`agd-popover agd-popover--fim agd-popover--menu${acima ? ' agd-popover--acima' : ''}`} role="menu" aria-label={`Ações do agendamento de ${ag.cliente.nome}`} onKeyDown={aoTeclarNoMenu}>
          <button type="button" role="menuitem" className="agd-menu-item" onClick={executar(() => controle.abrirDetalhes(ag.id))}>Ver detalhes</button>
          <button type="button" role="menuitem" className="agd-menu-item" onClick={executar(() => controle.abrirEdicao(ag.id))}>Editar</button>
          {ag.status === 'aguardando' && (
            <button type="button" role="menuitem" className="agd-menu-item" onClick={executar(() => controle.confirmar(ag.id))}>Confirmar agendamento</button>
          )}
          {ag.status === 'cancelado' && (
            <button type="button" role="menuitem" className="agd-menu-item" onClick={executar(() => controle.reabrir(ag.id))}>Reabrir agendamento</button>
          )}
          {ag.status !== 'cancelado' && (
            <>
              <div className="agd-menu-separador" role="separator" />
              <button type="button" role="menuitem" className="agd-menu-item agd-menu-item--perigo" onClick={executar(() => controle.solicitarCancelamento([ag.id]))}>Cancelar agendamento</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}