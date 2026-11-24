import { useState } from 'react'
import type { FormEvent } from 'react'
import { Check } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Switch from '../../components/ui/Switch'
import { ApiError } from '../../lib/api'
import { apenasDigitos, formatarDuracao, formatarTelefone } from '../../lib/formatters'
import { useConsulta } from '../../lib/useConsulta'
import { listarServicos } from '../servicos/servicosApi'
import { atualizarProfissional, criarProfissional } from './profissionaisApi'
import type { Profissional, ProfissionalEntrada } from './types'

interface ProfissionalFormModalProps {
  open: boolean
  profissional: Profissional | null
  onClose: () => void
  onSaved: (profissional: Profissional, novo: boolean) => void
}

type Campo = 'nome' | 'email' | 'telefone' | 'servicoIds'
type Erros = Partial<Record<Campo, string>>

interface Valores {
  nome: string
  email: string
  telefone: string
  servicoIds: number[]
}

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validar(valores: Valores): Erros {
  const erros: Erros = {}
  const digitos = apenasDigitos(valores.telefone)

  if (valores.nome.trim().length < 3) erros.nome = 'Informe o nome completo.'
  else if (valores.nome.trim().length > 120) erros.nome = 'Use no máximo 120 caracteres.'

  if (!valores.email.trim()) erros.email = 'Informe o e-mail.'
  else if (!EMAIL_VALIDO.test(valores.email.trim())) erros.email = 'Digite um e-mail válido, como nome@empresa.com.'

  if (digitos && (digitos.length < 10 || digitos.length > 11)) erros.telefone = 'Digite o DDD e o número.'

  if (valores.servicoIds.length === 0) erros.servicoIds = 'Escolha pelo menos um serviço.'

  return erros
}

function ProfissionalFormModal({ open, profissional, onClose, onSaved }: ProfissionalFormModalProps) {
  const [valores, setValores] = useState<Valores>({
    nome: profissional?.nome ?? '',
    email: profissional?.email ?? '',
    telefone: formatarTelefone(profissional?.telefone ?? ''),
    servicoIds: profissional?.servicos.map((servico) => servico.id) ?? [],
  })
  const [ativo, setAtivo] = useState(profissional?.ativo ?? true)
  const [erros, setErros] = useState<Erros>({})
  const [erroGeral, setErroGeral] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const servicos = useConsulta(listarServicos, { busca: '', status: 'ativos', pagina: 0, tamanho: 100 })
  const editando = profissional !== null

  const opcoes = [...(servicos.dados?.content ?? [])]
  for (const atual of profissional?.servicos ?? []) {
    if (!opcoes.some((item) => item.id === atual.id)) {
      opcoes.push({ ...atual, descricao: null, duracaoMinutos: 0, ativo: false, totalProfissionais: 0 })
    }
  }
  opcoes.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  function atualizar(proximo: Partial<Valores>) {
    const novos = { ...valores, ...proximo }
    setValores(novos)
    if (enviado) setErros(validar(novos))
  }

  function alternarServico(id: number) {
    const marcado = valores.servicoIds.includes(id)
    atualizar({ servicoIds: marcado ? valores.servicoIds.filter((item) => item !== id) : [...valores.servicoIds, id] })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEnviado(true)
    setErroGeral('')

    const encontrados = validar(valores)
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0) return

    const dados: ProfissionalEntrada = {
      nome: valores.nome.trim(),
      email: valores.email.trim().toLowerCase(),
      telefone: apenasDigitos(valores.telefone) || null,
      ativo,
      servicoIds: valores.servicoIds,
    }

    setSalvando(true)

    try {
      const salvo = editando ? await atualizarProfissional(profissional.id, dados) : await criarProfissional(dados)
      onSaved(salvo, !editando)
    } catch (falha) {
      setSalvando(false)

      if (falha instanceof ApiError && falha.status === 409) {
        setErros({ email: falha.message })
        return
      }

      if (falha instanceof ApiError && falha.campos.length > 0) {
        const doServidor: Erros = {}
        for (const item of falha.campos) {
          if (item.campo === 'nome' || item.campo === 'email' || item.campo === 'telefone' || item.campo === 'servicoIds') {
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
      title={editando ? 'Editar profissional' : 'Novo profissional'}
      description={
        editando
          ? 'Os serviços marcados definem o que essa pessoa pode atender.'
          : 'Depois de cadastrar, defina os horários de atendimento.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" form="profissional-form" loading={salvando}>
            {editando ? 'Salvar alterações' : 'Cadastrar profissional'}
          </Button>
        </>
      }
    >
      <form id="profissional-form" noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        {erroGeral && (
          <p role="alert" className="rounded-md border border-[#F1C9CA] bg-[#FBEDED] px-3.5 py-2.5 text-xs leading-snug text-danger">
            {erroGeral}
          </p>
        )}

        <Input
          label="Nome completo"
          placeholder="Ex.: Ana Souza"
          autoComplete="name"
          value={valores.nome}
          maxLength={120}
          error={erros.nome}
          onChange={(event) => atualizar({ nome: event.target.value })}
          data-autofocus
        />

        <div className="grid gap-5 sm:grid-cols-[1.4fr_1fr]">
          <Input
            label="E-mail"
            type="email"
            placeholder="nome@empresa.com"
            autoComplete="email"
            value={valores.email}
            maxLength={150}
            error={erros.email}
            onChange={(event) => atualizar({ email: event.target.value })}
          />

          <Input
            label="Telefone"
            type="tel"
            inputMode="numeric"
            placeholder="(82) 99999-0000"
            autoComplete="tel"
            value={valores.telefone}
            error={erros.telefone}
            onChange={(event) => atualizar({ telefone: formatarTelefone(event.target.value) })}
          />
        </div>

        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-1 flex w-full items-baseline justify-between gap-3">
            <span className="text-[13px] leading-none font-medium text-ink">Serviços que atende</span>
            {valores.servicoIds.length > 0 && (
              <span className="text-[11px] text-placeholder tabular-nums">{valores.servicoIds.length} marcados</span>
            )}
          </legend>

          {servicos.carregando && !servicos.dados ? (
            <div aria-hidden="true" className="flex flex-wrap gap-2 pt-1.5">
              {[120, 90, 140, 100, 80].map((largura) => (
                <span key={largura} style={{ width: largura }} className="h-[34px] animate-pulse rounded-full bg-[#EEF0ED]" />
              ))}
            </div>
          ) : servicos.erro && !servicos.dados ? (
            <p className="pt-1.5 text-xs text-danger">
              Não foi possível carregar os serviços.{' '}
              <button type="button" onClick={servicos.recarregar} className="font-medium underline underline-offset-2">
                Tentar de novo
              </button>
            </p>
          ) : opcoes.length === 0 ? (
            <p className="pt-1.5 text-xs text-muted">Cadastre um serviço ativo antes de vincular profissionais.</p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1.5">
              {opcoes.map((servico) => {
                const marcado = valores.servicoIds.includes(servico.id)

                return (
                  <button
                    key={servico.id}
                    type="button"
                    aria-pressed={marcado}
                    onClick={() => alternarServico(servico.id)}
                    className={`inline-flex h-[34px] items-center gap-1.5 rounded-full border pr-3.5 text-xs transition-[background-color,border-color,color,padding] duration-200 ${
                      marcado
                        ? 'border-brand bg-[#EDF2FA] pl-2.5 font-medium text-brand'
                        : 'border-line pl-3.5 text-ink hover:border-[#D3D9D4] hover:bg-surface-soft'
                    }`}
                  >
                    {marcado && <Check aria-hidden="true" size={14} strokeWidth={2} />}
                    {servico.nome}
                    {servico.duracaoMinutos > 0 && (
                      <span className={marcado ? 'text-brand/70' : 'text-placeholder'}>
                        {formatarDuracao(servico.duracaoMinutos)}
                      </span>
                    )}
                    {!servico.ativo && <span className="text-placeholder">(inativo)</span>}
                  </button>
                )
              })}
            </div>
          )}

          {erros.servicoIds && <p className="text-xs leading-snug text-danger">{erros.servicoIds}</p>}
        </fieldset>

        <div className="rounded-lg border border-line px-4 py-3.5">
          <Switch
            checked={ativo}
            onChange={setAtivo}
            label="Profissional ativo"
            description="Profissionais inativos não recebem novos agendamentos."
          />
        </div>
      </form>
    </Modal>
  )
}

export default ProfissionalFormModal