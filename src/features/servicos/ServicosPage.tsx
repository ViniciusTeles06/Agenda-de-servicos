import { useState } from 'react'
import { Clock3, Pencil, Plus, Power, RotateCcw, Search, Trash2, UsersRound } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import IconButton from '../../components/ui/IconButton'
import Input from '../../components/ui/Input'
import Pagination from '../../components/ui/Pagination'
import SegmentedControl from '../../components/ui/SegmentedControl'
import StatusBadge from '../../components/ui/StatusBadge'
import { useToast } from '../../components/ui/toast/toastContext'
import { formatarDuracao, pluralizar } from '../../lib/formatters'
import { useConsulta } from '../../lib/useConsulta'
import { useDebounce } from '../../lib/useDebounce'
import ServicoFormModal from './ServicoFormModal'
import { alterarStatusServico, excluirServico, listarServicos } from './servicosApi'
import type { FiltroStatus, Servico } from './types'

const TAMANHO_PAGINA = 8
const iconProps = { size: 16, strokeWidth: 1.6 }

const opcoesStatus: { value: FiltroStatus; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'ativos', label: 'Ativos' },
  { value: 'inativos', label: 'Inativos' },
]

interface AcoesProps {
  servico: Servico
  alterando: boolean
  onEditar: () => void
  onAlternar: () => void
  onExcluir: () => void
}

function Acoes({ servico, alterando, onEditar, onAlternar, onExcluir }: AcoesProps) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      <IconButton label={`Editar ${servico.nome}`} icon={<Pencil {...iconProps} />} onClick={onEditar} />
      <IconButton
        label={servico.ativo ? `Desativar ${servico.nome}` : `Ativar ${servico.nome}`}
        icon={servico.ativo ? <Power {...iconProps} /> : <RotateCcw {...iconProps} />}
        disabled={alterando}
        onClick={onAlternar}
      />
      <IconButton label={`Excluir ${servico.nome}`} tone="danger" icon={<Trash2 {...iconProps} />} onClick={onExcluir} />
    </div>
  )
}

function Profissionais({ total }: { total: number }) {
  return total === 0 ? (
    <span className="text-placeholder">Nenhum</span>
  ) : (
    <span>{pluralizar(total, 'profissional', 'profissionais')}</span>
  )
}

function LinhasCarregando() {
  return (
    <div aria-hidden="true" className="flex flex-col">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-center gap-6 border-b border-line px-6 py-[18px] last:border-b-0">
          <div className="flex flex-1 flex-col gap-2">
            <span className="h-3 w-40 animate-pulse rounded bg-[#EEF0ED]" />
            <span className="h-2.5 w-56 max-w-full animate-pulse rounded bg-[#F3F4F1]" />
          </div>
          <span className="hidden h-3 w-16 animate-pulse rounded bg-[#EEF0ED] md:block" />
          <span className="hidden h-3 w-24 animate-pulse rounded bg-[#EEF0ED] md:block" />
          <span className="h-[23px] w-16 animate-pulse rounded-full bg-[#EEF0ED]" />
        </div>
      ))}
    </div>
  )
}

function ServicosPage() {
  const reduceMotion = useReducedMotion()
  const toast = useToast()

  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState<FiltroStatus>('todos')
  const [pagina, setPagina] = useState(0)
  const buscaAtrasada = useDebounce(busca.trim(), 300)

  const { dados, erro, carregando, recarregar } = useConsulta(listarServicos, {
    busca: buscaAtrasada,
    status,
    pagina,
    tamanho: TAMANHO_PAGINA,
  })

  const [formulario, setFormulario] = useState<{ open: boolean; servico: Servico | null; chave: number }>({
    open: false,
    servico: null,
    chave: 0,
  })
  const [exclusao, setExclusao] = useState<{ open: boolean; servico: Servico | null; chave: number }>({
    open: false,
    servico: null,
    chave: 0,
  })
  const [alterandoId, setAlterandoId] = useState<number | null>(null)

  const servicos = dados?.content ?? []
  const filtrando = buscaAtrasada !== '' || status !== 'todos'
  const primeiraCarga = carregando && !dados

  function abrirFormulario(servico: Servico | null) {
    setFormulario((atual) => ({ open: true, servico, chave: atual.chave + 1 }))
  }

  function fecharFormulario() {
    setFormulario((atual) => ({ ...atual, open: false }))
  }

  function abrirExclusao(servico: Servico) {
    setExclusao((atual) => ({ open: true, servico, chave: atual.chave + 1 }))
  }

  function fecharExclusao() {
    setExclusao((atual) => ({ ...atual, open: false }))
  }

  function limparFiltros() {
    setBusca('')
    setStatus('todos')
    setPagina(0)
  }

  function handleSalvo(servico: Servico, novo: boolean) {
    fecharFormulario()
    toast({ title: novo ? 'Serviço criado' : 'Alterações salvas', description: servico.nome })
    recarregar()
  }

  async function handleAlternar(servico: Servico) {
    setAlterandoId(servico.id)

    try {
      const atualizado = await alterarStatusServico(servico.id, !servico.ativo)
      toast({ title: atualizado.ativo ? 'Serviço ativado' : 'Serviço desativado', description: atualizado.nome })
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
    const servico = exclusao.servico
    if (!servico) return

    await excluirServico(servico.id)
    fecharExclusao()
    toast({ title: 'Serviço excluído', description: servico.nome })

    if (servicos.length === 1 && pagina > 0) setPagina(pagina - 1)
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
        breadcrumb={[{ label: 'Workspace', to: '/app' }, { label: 'Serviços' }]}
        title="Serviços"
        description="Cadastre o que o seu negócio oferece e quanto tempo cada atendimento leva."
        actions={
          <Button icon={<Plus {...iconProps} />} iconHover="rotate" onClick={() => abrirFormulario(null)}>
            Novo serviço
          </Button>
        }
      />

      <Card className="mt-7 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Input
            type="search"
            placeholder="Buscar por nome ou descrição"
            aria-label="Buscar serviços"
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
              <p className="text-sm font-medium text-ink">Não foi possível carregar os serviços</p>
              <p className="max-w-sm text-xs text-muted">{erro.message}</p>
              <Button variant="secondary" size="sm" onClick={recarregar}>
                Tentar de novo
              </Button>
            </div>
          ) : servicos.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <p className="text-sm font-medium text-ink">
                {filtrando ? 'Nenhum serviço encontrado' : 'Nenhum serviço cadastrado'}
              </p>
              <p className="max-w-sm text-xs text-muted">
                {filtrando
                  ? 'Tente outro termo ou mude o filtro de status.'
                  : 'Cadastre o primeiro serviço para começar a montar a agenda.'}
              </p>
              {filtrando ? (
                <Button variant="secondary" size="sm" onClick={limparFiltros}>
                  Limpar filtros
                </Button>
              ) : (
                <Button size="sm" icon={<Plus {...iconProps} />} onClick={() => abrirFormulario(null)}>
                  Novo serviço
                </Button>
              )}
            </div>
          ) : (
            <>
              <table className="hidden w-full text-left md:table">
                <thead>
                  <tr className="border-b border-line bg-surface-soft text-xs text-muted">
                    <th scope="col" className="px-6 py-3 font-normal">Serviço</th>
                    <th scope="col" className="px-4 py-3 font-normal">Duração</th>
                    <th scope="col" className="px-4 py-3 font-normal">Profissionais</th>
                    <th scope="col" className="px-4 py-3 font-normal">Status</th>
                    <th scope="col" className="px-6 py-3 text-right font-normal">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {servicos.map((servico, index) => (
                    <motion.tr
                      key={servico.id}
                      {...animacaoLinha(index)}
                      className="border-b border-line text-[13px] text-ink transition-colors duration-150 last:border-b-0 hover:bg-surface-soft"
                    >
                      <td className="max-w-0 px-6 py-3.5">
                        <p className={`truncate font-medium ${servico.ativo ? 'text-ink' : 'text-muted'}`}>{servico.nome}</p>
                        <p className="mt-1 truncate text-xs text-muted">{servico.descricao ?? 'Sem descrição'}</p>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap tabular-nums">{formatarDuracao(servico.duracaoMinutos)}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <Profissionais total={servico.totalProfissionais} />
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge tone={servico.ativo ? 'success' : 'neutral'}>{servico.ativo ? 'Ativo' : 'Inativo'}</StatusBadge>
                      </td>
                      <td className="w-[1%] px-6 py-3.5">
                        <Acoes
                          servico={servico}
                          alterando={alterandoId === servico.id}
                          onEditar={() => abrirFormulario(servico)}
                          onAlternar={() => handleAlternar(servico)}
                          onExcluir={() => abrirExclusao(servico)}
                        />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              <ul className="flex flex-col md:hidden">
                {servicos.map((servico, index) => (
                  <motion.li key={servico.id} {...animacaoLinha(index)} className="border-b border-line px-4 py-4 last:border-b-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`truncate text-[13px] font-medium ${servico.ativo ? 'text-ink' : 'text-muted'}`}>{servico.nome}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted">{servico.descricao ?? 'Sem descrição'}</p>
                      </div>
                      <StatusBadge tone={servico.ativo ? 'success' : 'neutral'}>{servico.ativo ? 'Ativo' : 'Inativo'}</StatusBadge>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-4 text-xs text-muted">
                        <span className="flex items-center gap-1.5 tabular-nums">
                          <Clock3 size={14} strokeWidth={1.6} />
                          {formatarDuracao(servico.duracaoMinutos)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <UsersRound size={14} strokeWidth={1.6} />
                          <Profissionais total={servico.totalProfissionais} />
                        </span>
                      </div>
                      <Acoes
                        servico={servico}
                        alterando={alterandoId === servico.id}
                        onEditar={() => abrirFormulario(servico)}
                        onAlternar={() => handleAlternar(servico)}
                        onExcluir={() => abrirExclusao(servico)}
                      />
                    </div>
                  </motion.li>
                ))}
              </ul>
            </>
          )}
        </div>

        {dados && servicos.length > 0 && (
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

      <ServicoFormModal
        key={formulario.chave}
        open={formulario.open}
        servico={formulario.servico}
        onClose={fecharFormulario}
        onSaved={handleSalvo}
      />

      <ConfirmDialog
        key={`excluir-${exclusao.chave}`}
        open={exclusao.open}
        title="Excluir serviço?"
        description={
          exclusao.servico
            ? `“${exclusao.servico.nome}” será removido de vez. Se ele já foi usado em agendamentos, desative em vez de excluir.`
            : ''
        }
        confirmLabel="Excluir serviço"
        onConfirm={handleExcluir}
        onClose={fecharExclusao}
      />
    </>
  )
}

export default ServicosPage