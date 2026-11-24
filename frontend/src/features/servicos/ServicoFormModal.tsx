import { useState } from 'react'
import type { FormEvent } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Switch from '../../components/ui/Switch'
import Textarea from '../../components/ui/Textarea'
import { ApiError } from '../../lib/api'
import { formatarDuracao } from '../../lib/formatters'
import { atualizarServico, criarServico } from './servicosApi'
import type { Servico, ServicoEntrada } from './types'

interface ServicoFormModalProps {
  open: boolean
  servico: Servico | null
  onClose: () => void
  onSaved: (servico: Servico, novo: boolean) => void
}

type Campo = 'nome' | 'descricao' | 'duracaoMinutos'
type Erros = Partial<Record<Campo, string>>

const duracoesRapidas = [15, 30, 45, 60, 90, 120]

function validar(nome: string, descricao: string, duracao: string): Erros {
  const erros: Erros = {}
  const minutos = Number(duracao)

  if (nome.trim().length < 2) erros.nome = 'Informe o nome do serviço.'
  else if (nome.trim().length > 100) erros.nome = 'Use no máximo 100 caracteres.'

  if (descricao.length > 500) erros.descricao = 'Use no máximo 500 caracteres.'

  if (!duracao) erros.duracaoMinutos = 'Informe a duração em minutos.'
  else if (!Number.isInteger(minutos) || minutos < 1 || minutos > 720) erros.duracaoMinutos = 'A duração vai de 1 a 720 minutos.'

  return erros
}

function ServicoFormModal({ open, servico, onClose, onSaved }: ServicoFormModalProps) {
  const [nome, setNome] = useState(servico?.nome ?? '')
  const [descricao, setDescricao] = useState(servico?.descricao ?? '')
  const [duracao, setDuracao] = useState(servico ? String(servico.duracaoMinutos) : '30')
  const [ativo, setAtivo] = useState(servico?.ativo ?? true)
  const [erros, setErros] = useState<Erros>({})
  const [erroGeral, setErroGeral] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const editando = servico !== null

  function atualizarCampo(campo: Campo, valor: string) {
    if (campo === 'nome') setNome(valor)
    if (campo === 'descricao') setDescricao(valor)
    if (campo === 'duracaoMinutos') setDuracao(valor)

    if (enviado) {
      const proximo = { nome, descricao, duracao, [campo === 'duracaoMinutos' ? 'duracao' : campo]: valor }
      setErros(validar(proximo.nome, proximo.descricao, proximo.duracao))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEnviado(true)
    setErroGeral('')

    const encontrados = validar(nome, descricao, duracao)
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0) return

    const dados: ServicoEntrada = {
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      duracaoMinutos: Number(duracao),
      ativo,
    }

    setSalvando(true)

    try {
      const salvo = editando ? await atualizarServico(servico.id, dados) : await criarServico(dados)
      onSaved(salvo, !editando)
    } catch (falha) {
      setSalvando(false)

      if (falha instanceof ApiError && falha.status === 409) {
        setErros({ nome: falha.message })
        return
      }

      if (falha instanceof ApiError && falha.campos.length > 0) {
        const doServidor: Erros = {}
        for (const item of falha.campos) {
          if (item.campo === 'nome' || item.campo === 'descricao' || item.campo === 'duracaoMinutos') {
            doServidor[item.campo] = item.mensagem
          }
        }
        setErros(doServidor)
        return
      }

      setErroGeral(falha instanceof Error ? falha.message : 'Não foi possível salvar. Tente de novo.')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeDisabled={salvando}
      title={editando ? 'Editar serviço' : 'Novo serviço'}
      description={
        editando
          ? 'As mudanças valem para os próximos agendamentos.'
          : 'O serviço fica disponível para vincular aos profissionais.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" form="servico-form" loading={salvando}>
            {editando ? 'Salvar alterações' : 'Criar serviço'}
          </Button>
        </>
      }
    >
      <form id="servico-form" noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        {erroGeral && (
          <p role="alert" className="rounded-md border border-[#F1C9CA] bg-[#FBEDED] px-3.5 py-2.5 text-xs leading-snug text-danger">
            {erroGeral}
          </p>
        )}

        <Input
          label="Nome"
          placeholder="Ex.: Corte de cabelo"
          value={nome}
          maxLength={100}
          error={erros.nome}
          onChange={(event) => atualizarCampo('nome', event.target.value)}
          data-autofocus
        />

        <Textarea
          label="Descrição"
          placeholder="O que está incluído no serviço (opcional)"
          value={descricao}
          maxLength={500}
          error={erros.descricao}
          onChange={(event) => atualizarCampo('descricao', event.target.value)}
        />

        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-2.5 text-[13px] leading-none font-medium text-ink">Duração</legend>

          <div className="flex flex-wrap gap-2">
            {duracoesRapidas.map((minutos) => {
              const selecionada = Number(duracao) === minutos

              return (
                <button
                  key={minutos}
                  type="button"
                  aria-pressed={selecionada}
                  onClick={() => atualizarCampo('duracaoMinutos', String(minutos))}
                  className={`h-8 rounded-full border px-3 text-xs tabular-nums transition-colors duration-200 ${
                    selecionada
                      ? 'border-brand bg-[#EDF2FA] font-medium text-brand'
                      : 'border-line text-muted hover:border-[#D3D9D4] hover:text-ink'
                  }`}
                >
                  {formatarDuracao(minutos)}
                </button>
              )
            })}
          </div>

          <Input
            aria-label="Duração em minutos"
            type="number"
            inputMode="numeric"
            min={1}
            max={720}
            value={duracao}
            error={erros.duracaoMinutos}
            hint={!erros.duracaoMinutos && Number(duracao) > 0 ? `Equivale a ${formatarDuracao(Number(duracao))}.` : undefined}
            onChange={(event) => atualizarCampo('duracaoMinutos', event.target.value)}
            containerClassName="max-w-[180px]"
          />
        </fieldset>

        <div className="rounded-lg border border-line px-4 py-3.5">
          <Switch
            checked={ativo}
            onChange={setAtivo}
            label="Serviço ativo"
            description="Serviços inativos não aparecem para novos agendamentos."
          />
        </div>
      </form>
    </Modal>
  )
}

export default ServicoFormModal