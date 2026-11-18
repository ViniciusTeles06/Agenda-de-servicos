import { useCallback, useEffect, useRef, useState } from 'react';
import type { FocusEvent, KeyboardEvent as EventoTeclado } from 'react';

/**
 * Comportamento comum de menus/painéis suspensos: abre/fecha, fecha ao clicar fora, ao pressionar Esc
 * e quando o foco sai do componente. Se faltar espaço abaixo, o painel abre para cima; se faltar
 * à direita, alinha pela borda direita do gatilho. `larguraPainel` é a largura aproximada do painel.
 */
export function usePopover(larguraPainel = 232) {
  const [aberto, setAberto] = useState(false);
  const [acima, setAcima] = useState(false);
  const [fim, setFim] = useState(false);
  const raizRef = useRef<HTMLDivElement>(null);

  const fechar = useCallback((devolverFoco = false) => {
    setAberto(false);
    if (devolverFoco) raizRef.current?.querySelector<HTMLElement>('button')?.focus();
  }, []);

  const alternar = useCallback(() => {
    if (!aberto && raizRef.current) {
      const caixa = raizRef.current.getBoundingClientRect();
      setAcima(window.innerHeight - caixa.bottom < 280 && caixa.top > 280);
      // Sem espaço à direita? Alinha o painel pela borda direita do gatilho (se couber à esquerda).
      setFim(caixa.left + larguraPainel > window.innerWidth - 12 && caixa.right - larguraPainel >= 12);
    }
    setAberto(!aberto);
  }, [aberto, larguraPainel]);

  useEffect(() => {
    if (!aberto) return undefined;
    const aoClicarFora = (e: MouseEvent) => {
      if (raizRef.current && e.target instanceof Node && !raizRef.current.contains(e.target)) setAberto(false);
    };
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        fechar(true);
      }
    };
    document.addEventListener('mousedown', aoClicarFora);
    document.addEventListener('keydown', aoTeclar);
    return () => {
      document.removeEventListener('mousedown', aoClicarFora);
      document.removeEventListener('keydown', aoTeclar);
    };
  }, [aberto, fechar]);

  const aoSairFoco = useCallback((e: FocusEvent<HTMLDivElement>) => {
    if (e.relatedTarget instanceof Node && !e.currentTarget.contains(e.relatedTarget)) setAberto(false);
  }, []);

  return { aberto, acima, fim, alternar, fechar, raizRef, aoSairFoco };
}

/** Setas, Home e End percorrem os itens (role="menuitem*") de um menu. */
export function aoTeclarNoMenu(e: EventoTeclado<HTMLElement>): void {
  const itens = Array.from(
    e.currentTarget.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([disabled])'),
  );
  if (itens.length === 0) return;
  const atual = itens.findIndex((item) => item === document.activeElement);
  let proximo = -1;
  if (e.key === 'ArrowDown') proximo = (atual + 1) % itens.length;
  else if (e.key === 'ArrowUp') proximo = (atual - 1 + itens.length) % itens.length;
  else if (e.key === 'Home') proximo = 0;
  else if (e.key === 'End') proximo = itens.length - 1;
  if (proximo >= 0) {
    e.preventDefault();
    itens[proximo]?.focus();
  }
}