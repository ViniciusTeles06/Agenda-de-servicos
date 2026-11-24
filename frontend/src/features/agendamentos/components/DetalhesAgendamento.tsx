import type { ControleAgendamentos } from '../hooks/useControleAgendamentos';
import type { AgendamentoDetalhado } from '../types';
import { formatarDataExtensa } from '../utils/datas';
import { Avatar, Button, StatusBadge } from '../uiBase';
import { Modal } from './Modal';

interface Props {
  ag: AgendamentoDetalhado;
  controle: ControleAgendamentos;
}

/** Detalhes de um agendamento (usado pela listagem e pelo calendário). */
export function DetalhesAgendamento({ ag, controle }: Props) {
  return (
    <Modal titulo="Detalhes do agendamento" aoFechar={controle.fecharDetalhes}>
      <div className="agd-modal-corpo">
        <div className="agd-detalhes-topo">
          <StatusBadge status={ag.status} />
          <span className="agd-detalhes-codigo">Código {ag.id}</span>
        </div>
        <dl className="agd-detalhes">
          <div className="agd-detalhes-item">
            <dt>Cliente</dt>
            <dd className="agd-detalhes-pessoa">
              <Avatar name={ag.cliente.nome} size="md" />
              <span>
                <span className="agd-texto-principal">{ag.cliente.nome}</span>
                <span className="agd-texto-secundario">{ag.cliente.email}</span>
              </span>
            </dd>
          </div>
          <div className="agd-detalhes-item">
            <dt>Serviço</dt>
            <dd>{ag.servico.nome} · {ag.duracaoMin} min</dd>
          </div>
          <div className="agd-detalhes-item">
            <dt>Responsável</dt>
            <dd className="agd-detalhes-pessoa">
              <Avatar name={ag.profissional.nome} size="sm" />
              <span>{ag.profissional.nome}</span>
            </dd>
          </div>
          <div className="agd-detalhes-item">
            <dt>Data</dt>
            <dd className="agd-capitalizar">{formatarDataExtensa(ag.data)}</dd>
          </div>
          <div className="agd-detalhes-item">
            <dt>Horário</dt>
            <dd>{ag.hora} às {ag.horaFim}</dd>
          </div>
        </dl>
      </div>
      <div className="agd-modal-rodape agd-modal-rodape--acoes">
        <Button variant="outline" onClick={() => { controle.fecharDetalhes(); controle.abrirEdicao(ag.id); }}>Editar</Button>
        {ag.status === 'aguardando' && <Button variant="outline" onClick={() => controle.confirmar(ag.id)}>Confirmar</Button>}
        {ag.status === 'cancelado' && <Button variant="outline" onClick={() => controle.reabrir(ag.id)}>Reabrir</Button>}
        {ag.status !== 'cancelado' && <Button variant="danger" onClick={() => controle.solicitarCancelamento([ag.id])}>Cancelar agendamento</Button>}
        <Button onClick={controle.fecharDetalhes}>Fechar</Button>
      </div>
    </Modal>
  );
}