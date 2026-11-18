import type { ReactNode } from 'react';
import { IconeCalendario } from './Icones';

interface Props {
  titulo: string;
  descricao: string;
  acao?: ReactNode;
}

export function EstadoVazio({ titulo, descricao, acao }: Props) {
  return (
    <div className="agd-vazio">
      <span className="agd-vazio-icone" aria-hidden="true"><IconeCalendario tamanho={22} /></span>
      <h3 className="agd-vazio-titulo">{titulo}</h3>
      <p className="agd-vazio-descricao">{descricao}</p>
      {acao}
    </div>
  );
}