import { useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useAgendamentosDetalhados, useCatalogos } from '../hooks/useAgendamentos';
import type {
  Agendamento,
  AgendamentoDetalhado,
  CampoAgendamento,
  DadosAgendamento,
  ErrosAgendamento,
  ResultadoOperacao,
} from '../types';
import { dataValida, descreverExpediente, formatarDataExtensa, horaParaMin, minParaHora, paraIsoData } from '../utils/datas';
import { listarHorarios, validarAgendamento } from '../utils/regras';
import { Button, Input } from '../uiBase';
import { IconeAlerta } from './Icones';
import { Modal } from './Modal';

interface Props {
  modo: 'novo' | 'editar';
  original?: AgendamentoDetalhado | undefined;
  /** Valores sugeridos (ex.: clique em um horário livre do calendário). */
  prefill?: Partial<DadosAgendamento> | undefined;
  aoFechar: () => void;
  /** Em caso de sucesso quem chama fecha o formulário; em caso de erro devolvemos as mensagens aqui. */
  aoSalvar: (dados: DadosAgendamento) => ResultadoOperacao<Agendamento>;
}

type Valores = Record<CampoAgendamento, string>;

const CAMPOS: readonly CampoAgendamento[] = ['clienteId', 'profissionalId', 'servicoId', 'data', 'hora'];
const ID_CAMPO: Readonly<Record<CampoAgendamento, string>> = {
  clienteId: 'agd-form-cliente',
  profissionalId: 'agd-form-profissional',
  servicoId: 'agd-form-servico',
  data: 'agd-form-data',
  hora: 'agd-form-hora',
};

function valoresIniciais(original?: AgendamentoDetalhado, prefill?: Partial<DadosAgendamento>): Valores {
  if (original) {
    return {
      clienteId: original.clienteId,
      profissionalId: original.profissionalId,
      servicoId: original.servicoId,
      data: original.data,
      hora: original.hora,
    };
  }
  return {
    clienteId: prefill?.clienteId ?? '',
    profissionalId: prefill?.profissionalId ?? '',
    servicoId: prefill?.servicoId ?? '',
    data: prefill?.data ?? '',
    hora: prefill?.hora ?? '',
  };
}

interface CampoProps {
  campo: CampoAgendamento;
  passo: number;
  rotulo: string;
  erro?: string | undefined;
  dica?: string | undefined;
  /** Quando o controle não é um único elemento rotulável (ex.: grupo de horários). */
  semLabel?: boolean;
  children: ReactNode;
}

function Campo({ campo, passo, rotulo, erro, dica, semLabel = false, children }: CampoProps) {
  const id = ID_CAMPO[campo];
  const conteudoRotulo = (
    <>
      <span className="agd-passo" aria-hidden="true">{passo}</span>
      {rotulo}
    </>
  );
  return (
    <div className={`agd-campo${erro ? ' agd-campo--erro' : ''}`}>
      {semLabel ? (
        <span className="agd-rotulo" id={`${id}-rotulo`}>{conteudoRotulo}</span>
      ) : (
        <label className="agd-rotulo" htmlFor={id}>{conteudoRotulo}</label>
      )}
      {children}
      {dica && !erro && <p className="agd-dica" id={`${id}-dica`}>{dica}</p>}
      {erro && (
        <p className="agd-erro-texto" id={`${id}-erro`}>
          <IconeAlerta tamanho={14} />
          {erro}
        </p>
      )}
    </div>
  );
}

export function FormularioAgendamento({ modo, original, prefill, aoFechar, aoSalvar }: Props) {
  const catalogos = useCatalogos();
  const agendamentos = useAgendamentosDetalhados();
  const [agora] = useState(() => new Date());
  const [valores, setValores] = useState<Valores>(() => valoresIniciais(original, prefill));
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [tocados, setTocados] = useState<Partial<Record<CampoAgendamento, boolean>>>({});
  const [errosServidor, setErrosServidor] = useState<ErrosAgendamento>({});

  const profissional = catalogos.profissionais.find((p) => p.id === valores.profissionalId);
  const servico = catalogos.servicos.find((s) => s.id === valores.servicoId);
  const servicosDoProfissional = profissional
    ? catalogos.servicos.filter((s) => profissional.servicosIds.includes(s.id))
    : [];
  const clientesOrdenados = useMemo(
    () => catalogos.clientes.slice().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [catalogos.clientes],
  );

  const podeListar = !!profissional && !!servico && dataValida(valores.data);
  const horarios = useMemo(
    () =>
      podeListar
        ? listarHorarios({
            profissionalId: valores.profissionalId,
            servicoId: valores.servicoId,
            data: valores.data,
            clienteId: valores.clienteId || undefined,
            agendamentos,
            catalogos,
            agora,
            original,
          })
        : null,
    [
      podeListar,
      valores.profissionalId,
      valores.servicoId,
      valores.data,
      valores.clienteId,
      agendamentos,
      catalogos,
      agora,
      original,
    ],
  );

  const disponiveis = horarios ? horarios.horarios.filter((h) => h.disponivel) : [];
  // Um horário só vale enquanto estiver livre para a combinação atual (profissional + serviço + data).
  const horaEfetiva = horarios ? (disponiveis.some((h) => h.hora === valores.hora) ? valores.hora : '') : valores.hora;
  const horaDescartada = !!horarios && valores.hora !== '' && horaEfetiva === '';

  const dadosAtuais: DadosAgendamento = { ...valores, hora: horaEfetiva };
  const errosAtuais = validarAgendamento(dadosAtuais, { agendamentos, catalogos, agora, original });
  const erroDe = (campo: CampoAgendamento): string | undefined =>
    tentouEnviar || tocados[campo] ? (errosServidor[campo] ?? errosAtuais[campo]) : undefined;

  function tocar(campo: CampoAgendamento) {
    setTocados((t) => (t[campo] ? t : { ...t, [campo]: true }));
  }

  function alterar(campo: CampoAgendamento, valor: string) {
    setErrosServidor({});
    tocar(campo);
    setValores((atual) => {
      const proximo: Valores = { ...atual, [campo]: valor };
      if (campo === 'profissionalId') {
        const novo = catalogos.profissionais.find((p) => p.id === valor);
        if (!novo || !novo.servicosIds.includes(proximo.servicoId)) proximo.servicoId = '';
      }
      return proximo;
    });
  }

  function focarPrimeiroErro(erros: ErrosAgendamento) {
    const campo = CAMPOS.find((c) => erros[c]);
    if (campo) document.getElementById(ID_CAMPO[campo])?.focus();
  }

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTentouEnviar(true);
    const erros = validarAgendamento(dadosAtuais, { agendamentos, catalogos, agora: new Date(), original });
    if (Object.keys(erros).length > 0) {
      focarPrimeiroErro(erros);
      return;
    }
    const resultado = aoSalvar(dadosAtuais);
    if (!resultado.ok) {
      setErrosServidor(resultado.erros);
      focarPrimeiroErro(resultado.erros);
    }
  }

  const descreve = (campo: CampoAgendamento, temDica: boolean): string | undefined => {
    const id = ID_CAMPO[campo];
    if (erroDe(campo)) return `${id}-erro`;
    return temDica ? `${id}-dica` : undefined;
  };

  const textoResumo =
    profissional && servico && horaEfetiva && dataValida(valores.data)
      ? `${servico.nome} (${servico.duracaoMin} min) com ${profissional.nome}, ${formatarDataExtensa(valores.data)}, das ${horaEfetiva} às ${minParaHora(horaParaMin(horaEfetiva) + servico.duracaoMin)}.`
      : null;

  // Uma única mensagem na área de horários (o aviso de "dia sem expediente" não repete o erro da data).
  const mensagemHorarios = !horarios
    ? null
    : horarios.aviso && !erroDe('data')
      ? horarios.aviso
      : disponiveis.length === 0
        ? 'Não há horários livres neste dia para este serviço. Escolha outra data.'
        : null;

  const mostrarAlerta = (tentouEnviar && Object.keys(errosAtuais).length > 0) || !!errosServidor.geral;

  return (
    <Modal
      titulo={modo === 'novo' ? 'Novo agendamento' : 'Editar agendamento'}
      descricao={modo === 'novo' ? 'Escolha o cliente, o profissional, o serviço e um horário livre.' : 'Altere os dados e escolha um horário livre.'}
      aoFechar={aoFechar}
      fecharAoClicarFora={false}
    >
      <form className="agd-form" onSubmit={enviar} noValidate>
        <div className="agd-modal-corpo">
          {mostrarAlerta && (
            <p className="agd-alerta" role="alert">
              <IconeAlerta tamanho={16} />
              {errosServidor.geral ?? 'Revise os campos destacados antes de continuar.'}
            </p>
          )}
          {original?.status === 'cancelado' && (
            <p className="agd-aviso">Este agendamento está cancelado. Salvar as alterações não o reativa; use “Reabrir agendamento” para isso.</p>
          )}

          <Campo campo="clienteId" passo={1} rotulo="Cliente" erro={erroDe('clienteId')}>
            <select
              id={ID_CAMPO.clienteId}
              className="agd-select"
              value={valores.clienteId}
              onChange={(e) => alterar('clienteId', e.target.value)}
              onBlur={() => tocar('clienteId')}
              aria-invalid={!!erroDe('clienteId')}
              aria-describedby={descreve('clienteId', false)}
              data-autofocus=""
            >
              <option value="">Selecione um cliente</option>
              {clientesOrdenados.map((c) => (
                <option key={c.id} value={c.id}>{c.nome} — {c.email}</option>
              ))}
            </select>
          </Campo>

          <Campo
            campo="profissionalId"
            passo={2}
            rotulo="Profissional"
            erro={erroDe('profissionalId')}
            dica={profissional ? `Atende de ${descreverExpediente(profissional)}.` : undefined}
          >
            <select
              id={ID_CAMPO.profissionalId}
              className="agd-select"
              value={valores.profissionalId}
              onChange={(e) => alterar('profissionalId', e.target.value)}
              onBlur={() => tocar('profissionalId')}
              aria-invalid={!!erroDe('profissionalId')}
              aria-describedby={descreve('profissionalId', !!profissional)}
            >
              <option value="">Selecione um profissional</option>
              {catalogos.profissionais.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </Campo>

          <Campo
            campo="servicoId"
            passo={3}
            rotulo="Serviço"
            erro={erroDe('servicoId')}
            dica={!profissional ? 'Escolha o profissional para ver os serviços que ele realiza.' : servico ? `Duração: ${servico.duracaoMin} min.` : undefined}
          >
            <select
              id={ID_CAMPO.servicoId}
              className="agd-select"
              value={valores.servicoId}
              disabled={!profissional}
              onChange={(e) => alterar('servicoId', e.target.value)}
              onBlur={() => tocar('servicoId')}
              aria-invalid={!!erroDe('servicoId')}
              aria-describedby={descreve('servicoId', !profissional || !!servico)}
            >
              <option value="">{profissional ? 'Selecione um serviço' : 'Escolha primeiro o profissional'}</option>
              {servicosDoProfissional.map((s) => (
                <option key={s.id} value={s.id}>{s.nome} · {s.duracaoMin} min</option>
              ))}
            </select>
          </Campo>

          <Campo
            campo="data"
            passo={4}
            rotulo="Data"
            erro={erroDe('data')}
            dica={dataValida(valores.data) ? formatarDataExtensa(valores.data) : undefined}
          >
            <Input
              id={ID_CAMPO.data}
              type="date"
              value={valores.data}
              min={modo === 'novo' ? paraIsoData(agora) : undefined}
              onChange={(e) => alterar('data', e.target.value)}
              onBlur={() => tocar('data')}
              aria-invalid={!!erroDe('data')}
              aria-describedby={descreve('data', dataValida(valores.data))}
            />
          </Campo>

          <Campo campo="hora" passo={5} rotulo="Horário disponível" erro={erroDe('hora')} semLabel>
            {!podeListar && (
              <p className="agd-dica" id={`${ID_CAMPO.hora}-dica`}>Escolha o serviço e a data para ver os horários livres.</p>
            )}
            {mensagemHorarios && <p className="agd-aviso">{mensagemHorarios}</p>}
            {horaDescartada && (
              <p className="agd-aviso">O horário das {valores.hora} não está disponível para esta combinação. Escolha outro.</p>
            )}
            {horarios && disponiveis.length > 0 && (
              <div
                id={ID_CAMPO.hora}
                className="agd-horarios"
                role="radiogroup"
                tabIndex={-1}
                aria-labelledby={`${ID_CAMPO.hora}-rotulo`}
                aria-describedby={descreve('hora', false)}
              >
                {horarios.horarios.map((h) => (
                  <button
                    key={h.hora}
                    type="button"
                    role="radio"
                    aria-checked={h.hora === horaEfetiva}
                    disabled={!h.disponivel}
                    title={h.disponivel ? undefined : h.motivo}
                    className={`agd-horario${h.hora === horaEfetiva ? ' agd-horario--selecionado' : ''}`}
                    onClick={() => alterar('hora', h.hora)}
                  >
                    {h.hora}
                  </button>
                ))}
              </div>
            )}
          </Campo>

          {textoResumo && (
            <p className="agd-resumo" aria-live="polite">
              <strong>Resumo:</strong> {textoResumo}
            </p>
          )}
        </div>
        <div className="agd-modal-rodape">
          <Button variant="outline" onClick={aoFechar}>Cancelar</Button>
          <Button type="submit">{modo === 'novo' ? 'Agendar' : 'Salvar alterações'}</Button>
        </div>
      </form>
    </Modal>
  );
}