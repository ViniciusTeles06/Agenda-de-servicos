import { useCallback, useEffect, useRef, useState } from 'react';
import { agendamentosStore } from '../store/agendamentosStore';
import type { Agendamento, DadosAgendamento, ErrosAgendamento, ResultadoOperacao } from '../types';
import { formatarDataHora } from '../utils/datas';
import { useToasts } from './useToasts';

export type EstadoFormulario =
  | { modo: 'novo'; prefill?: Partial<DadosAgendamento> }
  | { modo: 'editar'; id: string };

export interface OpcoesControle {
  /** Chamado após criar um agendamento (a listagem usa para destacar o novo registro). */
  aoCriar?: (agendamento: Agendamento) => void;
  /** Chamado ao concluir um cancelamento confirmado pelo usuário (a listagem limpa a seleção). */
  aoCancelar?: () => void;
}

function primeiraMensagem(erros: ErrosAgendamento): string {
  return (
    erros.geral ?? erros.hora ?? erros.data ?? erros.servicoId ?? erros.profissionalId ?? erros.clienteId ??
    'Não foi possível concluir a ação.'
  );
}

function nomeDoCliente(id: string): string {
  return agendamentosStore.obterEstado().detalhados.find((d) => d.id === id)?.cliente.nome ?? 'cliente';
}

function plural(n: number, singular: string, pluralTexto: string): string {
  return `${n} ${n === 1 ? singular : pluralTexto}`;
}

/**
 * Orquestra o que é comum às telas de Agendamentos e Calendário: abrir formulário/detalhes,
 * confirmar, cancelar (com confirmação), reabrir, ações em lote e avisos (toasts).
 * Renderize <OverlaysAgendamento controle={controle} /> na tela para exibir os modais e avisos.
 */
export function useControleAgendamentos(opcoes: OpcoesControle = {}) {
  const { toasts, notificar, remover } = useToasts();
  const [formulario, setFormulario] = useState<EstadoFormulario | null>(null);
  const [detalhesId, setDetalhesId] = useState<string | null>(null);
  const [cancelamento, setCancelamento] = useState<readonly string[] | null>(null);
  const aoCriarRef = useRef(opcoes.aoCriar);
  const aoCancelarRef = useRef(opcoes.aoCancelar);

  useEffect(() => {
    aoCriarRef.current = opcoes.aoCriar;
    aoCancelarRef.current = opcoes.aoCancelar;
  });

  const abrirNovo = useCallback((prefill?: Partial<DadosAgendamento>) => {
    setFormulario(prefill ? { modo: 'novo', prefill } : { modo: 'novo' });
  }, []);
  const abrirEdicao = useCallback((id: string) => setFormulario({ modo: 'editar', id }), []);
  const fecharFormulario = useCallback(() => setFormulario(null), []);
  const abrirDetalhes = useCallback((id: string) => setDetalhesId(id), []);
  const fecharDetalhes = useCallback(() => setDetalhesId(null), []);
  const fecharCancelamento = useCallback(() => setCancelamento(null), []);
  const solicitarCancelamento = useCallback((ids: readonly string[]) => {
    if (ids.length > 0) setCancelamento(ids);
  }, []);

  const confirmar = useCallback(
    (id: string) => {
      const r = agendamentosStore.alterarStatus(id, 'confirmado');
      if (r.ok) notificar('sucesso', `Agendamento de ${nomeDoCliente(id)} confirmado.`);
      else notificar('erro', primeiraMensagem(r.erros));
    },
    [notificar],
  );

  const reabrir = useCallback(
    (id: string) => {
      const r = agendamentosStore.alterarStatus(id, 'aguardando');
      if (r.ok) notificar('sucesso', `Agendamento de ${nomeDoCliente(id)} reaberto e aguardando confirmação.`);
      else notificar('erro', primeiraMensagem(r.erros));
    },
    [notificar],
  );

  const executarCancelamento = useCallback(() => {
    const ids = cancelamento;
    setCancelamento(null);
    if (!ids || ids.length === 0) return;
    aoCancelarRef.current?.();
    const [unico] = ids;
    if (ids.length === 1 && unico !== undefined) {
      const r = agendamentosStore.alterarStatus(unico, 'cancelado');
      if (r.ok) notificar('sucesso', `Agendamento de ${nomeDoCliente(unico)} cancelado. O horário ficou livre.`);
      else notificar('erro', primeiraMensagem(r.erros));
      return;
    }
    const r = agendamentosStore.alterarStatusEmLote(ids, 'cancelado');
    if (r.alterados > 0) notificar('sucesso', `${plural(r.alterados, 'agendamento cancelado', 'agendamentos cancelados')}.`);
    else notificar('info', 'Os agendamentos selecionados já estavam cancelados.');
  }, [cancelamento, notificar]);

  const confirmarEmLote = useCallback(
    (ids: readonly string[]) => {
      const r = agendamentosStore.alterarStatusEmLote(ids, 'confirmado');
      if (r.alterados > 0) notificar('sucesso', `${plural(r.alterados, 'agendamento confirmado', 'agendamentos confirmados')}.`);
      else notificar('info', 'Os agendamentos selecionados já estavam confirmados.');
    },
    [notificar],
  );

  /** Chamado pelo formulário. Em caso de sucesso fecha o formulário e avisa; senão devolve os erros. */
  const salvarFormulario = useCallback(
    (dados: DadosAgendamento): ResultadoOperacao<Agendamento> => {
      if (!formulario) return { ok: false, erros: { geral: 'Nenhum formulário aberto.' } };
      if (formulario.modo === 'novo') {
        const r = agendamentosStore.criar(dados);
        if (r.ok) {
          notificar('sucesso', `Agendamento criado para ${nomeDoCliente(r.dados.id)} em ${formatarDataHora(r.dados.data, r.dados.hora)}.`);
          aoCriarRef.current?.(r.dados);
          setFormulario(null);
        }
        return r;
      }
      const r = agendamentosStore.atualizar(formulario.id, dados);
      if (r.ok) {
        notificar('sucesso', `Agendamento de ${nomeDoCliente(r.dados.id)} atualizado.`);
        setFormulario(null);
      }
      return r;
    },
    [formulario, notificar],
  );

  return {
    estado: { formulario, detalhesId, cancelamento },
    toasts,
    notificar,
    removerToast: remover,
    abrirNovo,
    abrirEdicao,
    fecharFormulario,
    abrirDetalhes,
    fecharDetalhes,
    solicitarCancelamento,
    executarCancelamento,
    fecharCancelamento,
    confirmar,
    reabrir,
    confirmarEmLote,
    salvarFormulario,
  };
}

export type ControleAgendamentos = ReturnType<typeof useControleAgendamentos>;