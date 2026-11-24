import { Button } from '../uiBase';
import { Modal } from './Modal';

interface Props {
  titulo: string;
  descricao: string;
  rotuloConfirmar: string;
  rotuloVoltar: string;
  aoConfirmar: () => void;
  aoFechar: () => void;
}

/** Confirmação de ações destrutivas (ex.: cancelar agendamento). */
export function ConfirmarAcaoDialog({ titulo, descricao, rotuloConfirmar, rotuloVoltar, aoConfirmar, aoFechar }: Props) {
  return (
    <Modal titulo={titulo} descricao={descricao} aoFechar={aoFechar} largura="sm">
      <div className="agd-modal-rodape">
        <Button variant="outline" onClick={aoFechar} data-autofocus="">{rotuloVoltar}</Button>
        <Button variant="danger" onClick={aoConfirmar}>{rotuloConfirmar}</Button>
      </div>
    </Modal>
  );
}