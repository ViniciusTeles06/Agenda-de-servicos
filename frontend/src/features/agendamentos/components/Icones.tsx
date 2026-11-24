import type { ReactNode } from 'react';

interface PropsIcone {
  tamanho?: number;
  className?: string;
}

function Icone({ tamanho = 16, className, children }: PropsIcone & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

export const IconeBusca = (p: PropsIcone) => (
  <Icone {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icone>
);
export const IconeChevronBaixo = (p: PropsIcone) => (<Icone {...p}><path d="m6 9 6 6 6-6" /></Icone>);
export const IconeChevronEsquerda = (p: PropsIcone) => (<Icone {...p}><path d="m15 18-6-6 6-6" /></Icone>);
export const IconeChevronDireita = (p: PropsIcone) => (<Icone {...p}><path d="m9 18 6-6-6-6" /></Icone>);
export const IconeFiltros = (p: PropsIcone) => (
  <Icone {...p}>
    <path d="M4 6h9M19 6h1M4 12h3M13 12h7M4 18h9M19 18h1" />
    <circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="16" cy="18" r="2" />
  </Icone>
);
export const IconeColunas = (p: PropsIcone) => (
  <Icone {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16M15 4v16" /></Icone>
);
export const IconeDownload = (p: PropsIcone) => (
  <Icone {...p}><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></Icone>
);
export const IconeMais = (p: PropsIcone) => (<Icone {...p}><path d="M12 5v14M5 12h14" /></Icone>);
export const IconeLapis = (p: PropsIcone) => (
  <Icone {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></Icone>
);
export const IconeReticencias = (p: PropsIcone) => (
  <Icone {...p}>
    <circle cx="5" cy="12" r="1.3" fill="currentColor" /><circle cx="12" cy="12" r="1.3" fill="currentColor" /><circle cx="19" cy="12" r="1.3" fill="currentColor" />
  </Icone>
);
export const IconeSetaBaixo = (p: PropsIcone) => (<Icone {...p}><path d="M12 5v14M19 12l-7 7-7-7" /></Icone>);
export const IconeSetaCima = (p: PropsIcone) => (<Icone {...p}><path d="M12 19V5M5 12l7-7 7 7" /></Icone>);
export const IconeCheck = (p: PropsIcone) => (<Icone {...p}><path d="M20 6 9 17l-5-5" /></Icone>);
export const IconeFechar = (p: PropsIcone) => (<Icone {...p}><path d="M18 6 6 18M6 6l12 12" /></Icone>);
export const IconeCalendario = (p: PropsIcone) => (
  <Icone {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></Icone>
);
export const IconeRelogio = (p: PropsIcone) => (
  <Icone {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icone>
);
export const IconeAlerta = (p: PropsIcone) => (
  <Icone {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></Icone>
);
export const IconeSucesso = (p: PropsIcone) => (
  <Icone {...p}><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></Icone>
);
export const IconeInfo = (p: PropsIcone) => (
  <Icone {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></Icone>
);