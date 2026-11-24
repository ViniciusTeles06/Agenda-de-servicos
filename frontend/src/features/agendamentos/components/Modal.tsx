import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import '../styles/base.css';
import { IconeFechar } from './Icones';

/** Pilha de modais abertos: Esc e Tab só valem para o de cima (ex.: confirmação sobre detalhes). */
const pilhaDeModais: symbol[] = [];

const SELETOR_FOCAVEL =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function listarFocaveis(raiz: HTMLElement): HTMLElement[] {
  return Array.from(raiz.querySelectorAll<HTMLElement>(SELETOR_FOCAVEL)).filter(
    (el) => el.getClientRects().length > 0,
  );
}

interface ModalProps {
  titulo: string;
  descricao?: string;
  aoFechar: () => void;
  largura?: 'sm' | 'md';
  /** Fechar ao clicar na área escura. Desative em formulários para não perder o que foi digitado. */
  fecharAoClicarFora?: boolean;
  children: ReactNode;
}

export function Modal({ titulo, descricao, aoFechar, largura = 'md', fecharAoClicarFora = true, children }: ModalProps) {
  const idTitulo = useId();
  const idDescricao = useId();
  const caixaRef = useRef<HTMLDivElement>(null);
  const aoFecharRef = useRef(aoFechar);

  useEffect(() => {
    aoFecharRef.current = aoFechar;
  });

  useEffect(() => {
    const marca = Symbol('modal');
    const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    pilhaDeModais.push(marca);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const caixa = caixaRef.current;
    if (caixa) {
      (caixa.querySelector<HTMLElement>('[data-autofocus]') ?? listarFocaveis(caixa)[0] ?? caixa).focus();
    }

    function aoTeclar(e: KeyboardEvent) {
      if (pilhaDeModais[pilhaDeModais.length - 1] !== marca) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        aoFecharRef.current();
        return;
      }
      const raiz = caixaRef.current;
      if (e.key !== 'Tab' || !raiz) return;
      const focaveis = listarFocaveis(raiz);
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (!primeiro || !ultimo) {
        e.preventDefault();
        return;
      }
      const dentro = raiz.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === primeiro || !dentro)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (document.activeElement === ultimo || !dentro)) {
        e.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener('keydown', aoTeclar);
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      const posicao = pilhaDeModais.indexOf(marca);
      if (posicao >= 0) pilhaDeModais.splice(posicao, 1);
      document.body.style.overflow = overflowAnterior;
      anterior?.focus();
    };
  }, []);

  return createPortal(
    <div
      className="agd-root agd-sobreposicao"
      onMouseDown={(e) => {
        if (fecharAoClicarFora && e.target === e.currentTarget) aoFecharRef.current();
      }}
    >
      <div
        ref={caixaRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={descricao ? idDescricao : undefined}
        tabIndex={-1}
        className={`agd-modal agd-modal--${largura}`}
      >
        <header className="agd-modal-cabecalho">
          <div>
            <h2 id={idTitulo} className="agd-modal-titulo">{titulo}</h2>
            {descricao && <p id={idDescricao} className="agd-modal-descricao">{descricao}</p>}
          </div>
          <button type="button" className="agd-icone-botao" aria-label="Fechar" onClick={() => aoFecharRef.current()}>
            <IconeFechar />
          </button>
        </header>
        {children}
      </div>
    </div>,
    document.body,
  );
}