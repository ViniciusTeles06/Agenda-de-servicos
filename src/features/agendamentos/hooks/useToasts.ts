import { useCallback, useRef, useState } from 'react';

export type TipoToast = 'sucesso' | 'erro' | 'info';

export interface ItemToast {
  id: number;
  tipo: TipoToast;
  mensagem: string;
}

export function useToasts() {
  const [toasts, setToasts] = useState<ItemToast[]>([]);
  const contador = useRef(0);

  const remover = useCallback((id: number) => {
    setToasts((lista) => lista.filter((t) => t.id !== id));
  }, []);

  const notificar = useCallback((tipo: TipoToast, mensagem: string) => {
    contador.current += 1;
    const id = contador.current;
    setToasts((lista) => [...lista.slice(-3), { id, tipo, mensagem }]);
  }, []);

  return { toasts, notificar, remover };
}