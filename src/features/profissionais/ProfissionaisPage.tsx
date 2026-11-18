import { useState } from 'react'
import { Clock3, Pencil, Phone, Plus, Power, RotateCcw, Search, Trash2 } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import PageHeader from '../../components/layout/PageHeader'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import IconButton from '../../components/ui/IconButton'
import Input from '../../components/ui/Input'
import Pagination from '../../components/ui/Pagination'
import SegmentedControl from '../../components/ui/SegmentedControl'
import StatusBadge from '../../components/ui/StatusBadge'
import { useToast } from '../../components/ui/toast/toastContext'
import { formatarTelefone } from '../../lib/formatters'
import { useConsulta } from '../../lib/useConsulta'
import { useDebounce } from '../../lib/useDebounce'
import HorariosModal from './HorariosModal'
import ProfissionalFormModal from './ProfissionalFormModal'
import { alterarStatusProfissional, excluirProfissional, listarProfissionais } from './profissionaisApi'
import type { FiltroStatus, Profissional, ServicoResumo } from './types'

const TAMANHO_PAGINA = 8
const iconProps = { size: 16, strokeWidth: 1.6 }

const opcoesStatus: { value: FiltroStatus; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'ativos', label: 'Ativos' },
  { value: 'inativos', label: 'Inativos' },
]

interface AcoesProps {
  profissional: Profissional
  alterando: boolean
  onEditar: () => void
  onHorarios: () => void
  onAlternar: () => void
  onExcluir: () => void
}

function Acoes({ profissional, alterando, onEditar, onHorarios, onAlternar, onExcluir }: AcoesProps) {
  const primeiroNome = profissional.nome.split(' ')[0]

  return (
    <div className="flex items-center justify-end gap-0.5">
      <IconButton label={`Horários de ${primeiroNome}`} icon={<Clock3 {...iconProps} />} onClick={onHorarios} />
      <IconButton label={`Editar ${primeiroNome}`} icon={<Pencil {...iconProps} />} onClick={onEditar} />
      <IconButton
        label={profissional.ativo ? `Desativar ${primeiroNome}` : `Ativar ${primeiroNome}`}
        icon={profissional.ativo ? <Power {...iconProps} /> : <RotateCcw {...iconProps} />}
        disabled={alterando}
        onClick={onAlternar}
      />
      <IconButton label={`Excluir ${primeiroNome}`} tone="danger" icon={<Trash2 {...iconProps} />} onClick={onExcluir} />
    </div>
  )
}

function Servicos({ servicos }: { servicos: ServicoResumo[] }) {
  if (servicos.length === 0) return <span className="text-xs text-placeholder">Nenhum serviço</span>

  const visiveis = servicos.slice(0, 2)
  const restantes = servicos.length - visiveis.length

  return (
    <div className="flex flex-wrap items-center gap-1.5" title={servicos.map((servico) => servico.nome).join(', ')}>
      {visiveis.map((servico) => (
        <span key={servico.id} className="inline-flex h-[23px] items-center rounded-full border border-line bg-surface px-2.5 text-xs text-ink">
          {servico.nome}
        </span>
      ))}
      {restantes > 0 && (
        <span className="inline-flex h-[23px] items-center rounded-full bg-surface-soft px-2 text-xs text-muted tabular-nums">
          +{restantes}
        </span>
      )}
    </div>
  )
}

function LinhasCarregando() {
  return (
    <div aria-hidden="true" className="flex flex-col">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex items-center gap-4 border-b border-line px-6 py-4 last:border-b-0">
          <span className="size-[34px] shrink-0 animate-pulse rounded-full bg-[#EEF0ED]" />
          <div className="flex flex-1 flex-col gap-2">
            <span className="h-3 w-36 animate-pulse rounded bg-[#EEF0ED]" />
            <span className="h-2.5 w-48 max-w-full animate-pulse rounded bg-[#F3F4F1]" />
          </div>
          <span className="hidden h-[23px] w-40 animate-pulse rounded-full bg-[#EEF0ED] md:block" />
          <span className="h-[23px] w-16 animate-pulse rounded-full bg-[#EEF0ED]" />
        </div>
      ))}
    </div>
  )
}

function ProfissionaisPage() {
  const reduceMotion = useReducedMotion()
  const toast = useToast()

  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState<FiltroStatus>('todos')
  const [pagina, setPagina] = useState(0)
  const buscaAtrasada = useDebounce(busca.trim(), 300)

  const { dados, erro, carregando, recarregar } = useConsulta(listarProfissionais, {
    busca: buscaAtrasada,
    status,
    pagina,
    tamanho: TAMANHO_PAGINA,
  })

  const [formulario, setFormulario] = useState<{ open: boolean; profissional: Profissional | null; chave: number }>({
    open: false,
    profissional: null,
    chave: 0,
  })
  const [exclusao, setExclusao] = useState<{ open: boolean; profissional: Profissional | null; chave: number }>({
    open: false,
    profissional: null,
    chave: 0,
  })
  const [horarios, setHorarios] = useState<{ open: boolean; profissional: Profissional | null; chave: number }>({
    open: false,
    profissional: null,
    chave: 0,
  })
  const [alterandoId, setAlterandoId] = useState<number | null>(null)

  const profissionais = dados?.content ?? []
  const filtrando = buscaAtrasada !== '' || status !== 'todos'
  const primeiraCarga = carregando && !dados

  function abrirFormulario(profissional: Profissional | null) {
    setFormulario((atual) => ({ open: true, profissional, chave: atual.chave + 1 }))
  }

  function fecharFormulario() {
    setFormulario((atual) => ({ ...atual, open: false }))
  }

  function abrirHorarios(profissional: Profissional) {
    setHorarios((atual) => ({ open: true, profissional, chave: atual.chave + 1 }))
  }

  function fecharHorarios() {
    setHorarios((atual) => ({ ...atual, open: false }))
  }

  function handleHorariosSalvos(profissional: Profissional) {
    fecharHorarios()
    toast({ title: 'Horários salvos', description: profissional.nome })
  }

  function abrirExclusao(profissional: Profissional) {
    setExclusao((atual) => ({ open: true, profissional, chave: atual.chave + 1 }))
  }

  function fecharExclusao() {
    setExclusao((atual) => ({ ...atual, open: false }))
  }

  function limparFiltros() {
    setBusca('')
    setStatus('todos')
    setPagina(0)
  }

  function handleSalvo(profissional: Profissional, novo: boolean) {
    fecharFormulario()
    toast({ title: novo ? 'Profissional cadastrado' : 'Alterações salvas', description: profissional.nome })
    recarregar()
  }

  async function handleAlternar(profissional: Profissional) {
    setAlterandoId(profissional.id)

    try {
      const atualizado = await alterarStatusProfissional(profissional.id, !profissional.ativo)
      toast({ title: atualizado.ativo ? 'Profissional ativado' : 'Profissional desativado', description: atualizado.nome })
      recarregar()
    } catch (falha) {
      toast({
        tone: 'error',
        title: 'Não foi possível alterar o status',
        description: falha instanceof Error ? falha.message : undefined,
      })
    } finally {
      setAlterandoId(null)
    }
  }

  async function handleExcluir() {
    const profissional = exclusao.profissional
    if (!profissional) return

    await excluirProfissional(profissional.id)
    fecharExclusao()
    toast({ title: 'Profissional excluído', description: profissional.nome })

    if (profissionais.length === 1 && pagina > 0) setPagina(pagina - 1)
    else recarregar()
  }

  const animacaoLinha = (index: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.28, delay: index * 0.035, ease: [0.22, 1, 0.36, 1] as const },
        }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Workspace', to: '/app' }, { label: 'Profissionais' }]}
        title="Profissionais"
        description="Quem atende no seu negócio e quais serviços cada pessoa faz."
        actions={
          <Button icon={<Plus {...iconProps} />} iconHover="rotate" onClick={() => abrirFormulario(null)}>
            Novo profissional
          </Button>
        }
      />

      <Card className="mt-7 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Input
            type="search"
            placeholder="Buscar por nome, e-mail ou serviço"
            aria-label="Buscar profissionais"
            icon={<Search {...iconProps} />}
            value={busca}
            onChange={(event) => {
              setBusca(event.target.value)
              setPagina(0)
            }}
            containerClassName="w-full sm:max-w-[320px]"
          />

          <SegmentedControl
            label="Filtrar por status"
            options={opcoesStatus}
            value={status}
            onChange={(valor) => {
              setStatus(valor)
              setPagina(0)
            }}
          />
        </div>

        <div aria-busy={carregando} className={`transition-opacity duration-200 ${carregando && dados ? 'opacity-60' : ''}`}>
          {primeiraCarga ? (
            <LinhasCarregando />
          ) : erro && !dados ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <p className="text-sm font-medium text-ink">Não foi possível carregar os profissionais</p>
              <p className="max-w-sm text-xs text-muted">{erro.message}</p>
              <Button variant="secondary" size="sm" onClick={recarregar}>
                Tentar de novo
              </Button>
            </div>
          ) : profissionais.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <p className="text-sm font-medium text-ink">
                {filtrando ? 'Nenhum profissional encontrado' : 'Nenhum profissional cadastrado'}
              </p>
              <p className="max-w-sm text-xs text-muted">
                {filtrando
                  ? 'Tente outro termo ou mude o filtro de status.'
                  : 'Cadastre quem vai atender para liberar os agendamentos.'}
              </p>
              {filtrando ? (
                <Button variant="secondary" size="sm" onClick={limparFiltros}>
                  Limpar filtros
                </Button>
              ) : (
                <Button size="sm" icon={<Plus {...iconProps} />} onClick={() => abrirFormulario(null)}>
                  Novo profissional
                </Button>
              )}
            </div>
          ) : (
            <>
              <table className="hidden w-full text-left md:table">
                <thead>
                  <tr className="border-b border-line bg-surface-soft text-xs text-muted">
                    <th scope="col" className="w-[32%] px-6 py-3 font-normal">Profissional</th>
                    <th scope="col" className="px-4 py-3 font-normal">Telefone</th>
                    <th scope="col" className="px-4 py-3 font-normal">Serviços</th>
                    <th scope="col" className="px-4 py-3 font-normal">Status</th>
                    <th scope="col" className="px-6 py-3 text-right font-normal">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {profissionais.map((profissional, index) => (
                    <motion.tr
                      key={profissional.id}
                      {...animacaoLinha(index)}
                      className="border-b border-line text-[13px] text-ink transition-colors duration-150 last:border-b-0 hover:bg-surface-soft"
                    >
                      <td className="max-w-0 px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={profissional.nome} />
                          <div className="min-w-0">
                            <p className={`truncate font-medium ${profissional.ativo ? 'text-ink' : 'text-muted'}`}>{profissional.nome}</p>
                            <p className="mt-1 truncate text-xs text-muted">{profissional.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap tabular-nums">
                        {profissional.telefone ? formatarTelefone(profissional.telefone) : <span className="text-placeholder">Não informado</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <Servicos servicos={profissional.servicos} />
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge tone={profissional.ativo ? 'success' : 'neutral'}>{profissional.ativo ? 'Ativo' : 'Inativo'}</StatusBadge>
                      </td>
                      <td className="w-[1%] px-6 py-3.5">
                        <Acoes
                          profissional={profissional}
                          alterando={alterandoId === profissional.id}
                          onEditar={() => abrirFormulario(profissional)}
                          onHorarios={() => abrirHorarios(profissional)}
                          onAlternar={() => handleAlternar(profissional)}
                          onExcluir={() => abrirExclusao(profissional)}
                        />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              <ul className="flex flex-col md:hidden">
                {profissionais.map((profissional, index) => (
                  <motion.li key={profissional.id} {...animacaoLinha(index)} className="border-b border-line px-4 py-4 last:border-b-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={profissional.nome} />
                        <div className="min-w-0">
                          <p className={`truncate text-[13px] font-medium ${profissional.ativo ? 'text-ink' : 'text-muted'}`}>{profissional.nome}</p>
                          <p className="mt-1 truncate text-xs text-muted">{profissional.email}</p>
                        </div>
                      </div>
                      <StatusBadge tone={profissional.ativo ? 'success' : 'neutral'}>{profissional.ativo ? 'Ativo' : 'Inativo'}</StatusBadge>
                    </div>

                    <div className="mt-3">
                      <Servicos servicos={profissional.servicos} />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-xs text-muted tabular-nums">
                        <Phone size={14} strokeWidth={1.6} />
                        {profissional.telefone ? formatarTelefone(profissional.telefone) : 'Não informado'}
                      </span>
                      <Acoes
                        profissional={profissional}
                        alterando={alterandoId === profissional.id}
                        onEditar={() => abrirFormulario(profissional)}
                        onHorarios={() => abrirHorarios(profissional)}
                        onAlternar={() => handleAlternar(profissional)}
                        onExcluir={() => abrirExclusao(profissional)}
                      />
                    </div>
                  </motion.li>
                ))}
              </ul>
            </>
          )}
        </div>

        {dados && profissionais.length > 0 && (
          <div className="border-t border-line px-4 py-3 sm:px-6">
            <Pagination
              page={dados.number}
              totalPages={dados.totalPages}
              totalItems={dados.totalElements}
              pageSize={dados.size}
              onChange={setPagina}
            />
          </div>
        )}
      </Card>

      <ProfissionalFormModal
        key={formulario.chave}
        open={formulario.open}
        profissional={formulario.profissional}
        onClose={fecharFormulario}
        onSaved={handleSalvo}
      />

      <HorariosModal
        key={`horarios-${horarios.chave}`}
        open={horarios.open}
        profissional={horarios.profissional}
        onClose={fecharHorarios}
        onSaved={handleHorariosSalvos}
      />

      <ConfirmDialog
        key={`excluir-${exclusao.chave}`}
        open={exclusao.open}
        title="Excluir profissional?"
        description={
          exclusao.profissional
            ? `“${exclusao.profissional.nome}” e os horários dele serão removidos. Se ele já tem agendamentos, desative em vez de excluir.`
            : ''
        }
        confirmLabel="Excluir profissional"
        onConfirm={handleExcluir}
        onClose={fecharExclusao}
      />
    </>
  )
}

export default ProfissionaisPage