import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ItemToast } from '../hooks/useToasts';
import '../styles/base.css';
import { IconeAlerta, IconeFechar, IconeInfo, IconeSucesso } from './Icones';

function Toast({ item, remover }: { item: ItemToast; remover: (id: number) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => remover(item.id), item.tipo === 'erro' ? 7000 : 4500);
    return () => window.clearTimeout(timer);
  }, [item.id, item.tipo, remover]);

  const Icone = item.tipo === 'sucesso' ? IconeSucesso : item.tipo === 'erro' ? IconeAlerta : IconeInfo;
  return (
    <div className={`agd-toast agd-toast--${item.tipo}`} role={item.tipo === 'erro' ? 'alert' : 'status'}>
      <Icone tamanho={18} />
      <p className="agd-toast-texto">{item.mensagem}</p>
      <button type="button" className="agd-icone-botao agd-icone-botao--pequeno" aria-label="Dispensar aviso" onClick={() => remover(item.id)}>
        <IconeFechar tamanho={14} />
      </button>
    </div>
  );
}

export function RegiaoToasts({ toasts, remover }: { toasts: readonly ItemToast[]; remover: (id: number) => void }) {
  return createPortal(
    <div className="agd-root agd-toasts" aria-live="polite">
      {toasts.map((t) => (
        <Toast key={t.id} item={t} remover={remover} />
      ))}
    </div>,
    document.body,
  );
}