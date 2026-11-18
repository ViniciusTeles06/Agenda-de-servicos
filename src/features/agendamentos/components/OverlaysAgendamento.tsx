import { useAgendamentosDetalhados } from '../hooks/useAgendamentos';
import type { ControleAgendamentos } from '../hooks/useControleAgendamentos';
import { formatarDataHora } from '../utils/datas';
import { ConfirmarAcaoDialog } from './ConfirmarAcaoDialog';
import { DetalhesAgendamento } from './DetalhesAgendamento';
import { FormularioAgendamento } from './FormularioAgendamento';
import { RegiaoToasts } from './Toasts';

/** Modais (novo/editar, detalhes, confirmação de cancelamento) e avisos controlados por useControleAgendamentos. */
export function OverlaysAgendamento({ controle }: { controle: ControleAgendamentos }) {
  const detalhados = useAgendamentosDetalhados();
  const { formulario, detalhesId, cancelamento } = controle.estado;

  const detalhes = detalhesId ? detalhados.find((d) => d.id === detalhesId) : undefined;
  const original = formulario?.modo === 'editar' ? detalhados.find((d) => d.id === formulario.id) : undefined;
  const alvoCancelamento = cancelamento && cancelamento.length === 1 ? detalhados.find((d) => d.id === cancelamento[0]) : undefined;

  return (
    <>
      {formulario && (formulario.modo === 'novo' || original) && (
        <FormularioAgendamento
          key={formulario.modo === 'editar' ? formulario.id : 'novo'}
          modo={formulario.modo}
          original={original}
          prefill={formulario.modo === 'novo' ? formulario.prefill : undefined}
          aoFechar={controle.fecharFormulario}
          aoSalvar={controle.salvarFormulario}
        />
      )}
      {detalhes && <DetalhesAgendamento ag={detalhes} controle={controle} />}
      {cancelamento && (
        <ConfirmarAcaoDialog
          titulo={cancelamento.length === 1 ? 'Cancelar este agendamento?' : `Cancelar ${cancelamento.length} agendamentos?`}
          descricao={
            alvoCancelamento
              ? `O horário de ${formatarDataHora(alvoCancelamento.data, alvoCancelamento.hora)} com ${alvoCancelamento.profissional.nome} ficará livre. Você poderá reabrir o agendamento depois, se o horário continuar disponível.`
              : 'Os horários ficarão livres. Agendamentos que já estão cancelados serão ignorados.'
          }
          rotuloVoltar="Manter"
          rotuloConfirmar={cancelamento.length === 1 ? 'Cancelar agendamento' : 'Cancelar agendamentos'}
          aoConfirmar={controle.executarCancelamento}
          aoFechar={controle.fecharCancelamento}
        />
      )}
      <RegiaoToasts toasts={controle.toasts} remover={controle.removerToast} />
    </>
  );
}