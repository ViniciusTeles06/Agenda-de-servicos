import { useState } from 'react'
import { MapPin, Pencil, Phone, Plus, Search, Trash2 } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import PageHeader from '../../components/layout/PageHeader'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import IconButton from '../../components/ui/IconButton'
import Input from '../../components/ui/Input'
import Pagination from '../../components/ui/Pagination'
import { useToast } from '../../components/ui/toast/toastContext'
import { formatarTelefone } from '../../lib/formatters'
import { useConsulta } from '../../lib/useConsulta'
import { useDebounce } from '../../lib/useDebounce'
import ClienteFormModal from './ClienteFormModal'
import { excluirCliente, listarClientes } from './clientesApi'
import type { Cliente } from './types'

const TAMANHO_PAGINA = 8
const iconProps = { size: 16, strokeWidth: 1.6 }

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
          <span className="hidden h-3 w-32 animate-pulse rounded bg-[#EEF0ED] md:block" />
          <span className="hidden h-3 w-28 animate-pulse rounded bg-[#EEF0ED] lg:block" />
        </div>
      ))}
    </div>
  )
}

function Acoes({ cliente, onEditar, onExcluir }: { cliente: Cliente; onEditar: () => void; onExcluir: () => void }) {
  const primeiroNome = cliente.nome.split(' ')[0]
  return (
    <div className="flex items-center justify-end gap-0.5">
      <IconButton label={`Editar ${primeiroNome}`} icon={<Pencil {...iconProps} />} onClick={onEditar} />
      <IconButton label={`Excluir ${primeiroNome}`} tone="danger" icon={<Trash2 {...iconProps} />} onClick={onExcluir} />
    </div>
  )
}

function ClientesPage() {
  const reduceMotion = useReducedMotion()
  const toast = useToast()
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(0)
  const buscaAtrasada = useDebounce(busca.trim(), 300)
  const { dados, erro, carregando, recarregar } = useConsulta(listarClientes, { busca: buscaAtrasada, pagina, tamanho: TAMANHO_PAGINA })
  const [formulario, setFormulario] = useState<{ open: boolean; cliente: Cliente | null; chave: number }>({ open: false, cliente: null, chave: 0 })
  const [exclusao, setExclusao] = useState<{ open: boolean; cliente: Cliente | null; chave: number }>({ open: false, cliente: null, chave: 0 })

  const clientes = dados?.content ?? []
  const primeiraCarga = carregando && !dados

  function abrirFormulario(cliente: Cliente | null) {
    setFormulario((atual) => ({ open: true, cliente, chave: atual.chave + 1 }))
  }

  function fecharFormulario() {
    setFormulario((atual) => ({ ...atual, open: false }))
  }

  function abrirExclusao(cliente: Cliente) {
    setExclusao((atual) => ({ open: true, cliente, chave: atual.chave + 1 }))
  }

  function fecharExclusao() {
    setExclusao((atual) => ({ ...atual, open: false }))
  }

  function handleSalvo(cliente: Cliente, novo: boolean) {
    fecharFormulario()
    toast({ title: novo ? 'Cliente cadastrado' : 'Alterações salvas', description: cliente.nome })
    recarregar()
  }

  async function handleExcluir() {
    const cliente = exclusao.cliente
    if (!cliente) return
    await excluirCliente(cliente.id)
    fecharExclusao()
    toast({ title: 'Cliente excluído', description: cliente.nome })
    if (clientes.length === 1 && pagina > 0) setPagina(pagina - 1)
    else recarregar()
  }

  const animacaoLinha = (index: number) => reduceMotion ? {} : {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.28, delay: index * 0.035, ease: [0.22, 1, 0.36, 1] as const },
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Workspace', to: '/app' }, { label: 'Clientes' }]}
        title="Clientes"
        description="Cadastre e consulte os dados de quem agenda com você."
        actions={<Button icon={<Plus {...iconProps} />} iconHover="rotate" onClick={() => abrirFormulario(null)}>Novo cliente</Button>}
      />

      <Card className="mt-7 overflow-hidden">
        <div className="border-b border-line p-4 sm:px-6">
          <Input
            type="search"
            placeholder="Buscar por nome, e-mail, telefone ou cidade"
            aria-label="Buscar clientes"
            icon={<Search {...iconProps} />}
            value={busca}
            onChange={(event) => { setBusca(event.target.value); setPagina(0) }}
            containerClassName="w-full sm:max-w-[370px]"
          />
        </div>

        <div aria-busy={carregando} className={`transition-opacity duration-200 ${carregando && dados ? 'opacity-60' : ''}`}>
          {primeiraCarga ? <LinhasCarregando /> : erro && !dados ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <p className="text-sm font-medium text-ink">Não foi possível carregar os clientes</p>
              <p className="max-w-sm text-xs text-muted">{erro.message}</p>
              <Button variant="secondary" size="sm" onClick={recarregar}>Tentar de novo</Button>
            </div>
          ) : clientes.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <p className="text-sm font-medium text-ink">{buscaAtrasada ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}</p>
              <p className="max-w-sm text-xs text-muted">{buscaAtrasada ? 'Tente outro termo de busca.' : 'Cadastre seu primeiro cliente para começar a agendar atendimentos.'}</p>
              {buscaAtrasada ? <Button variant="secondary" size="sm" onClick={() => { setBusca(''); setPagina(0) }}>Limpar busca</Button> : <Button size="sm" icon={<Plus {...iconProps} />} onClick={() => abrirFormulario(null)}>Novo cliente</Button>}
            </div>
          ) : <>
            <table className="hidden w-full text-left md:table">
              <thead><tr className="border-b border-line bg-surface-soft text-xs text-muted">
                <th scope="col" className="w-[30%] px-6 py-3 font-normal">Cliente</th>
                <th scope="col" className="px-4 py-3 font-normal">Telefone</th>
                <th scope="col" className="px-4 py-3 font-normal">Cidade</th>
                <th scope="col" className="px-6 py-3 text-right font-normal"><span className="sr-only">Ações</span></th>
              </tr></thead>
              <tbody>{clientes.map((cliente, index) => (
                <motion.tr key={cliente.id} {...animacaoLinha(index)} className="border-b border-line text-[13px] text-ink transition-colors duration-150 last:border-b-0 hover:bg-surface-soft">
                  <td className="max-w-0 px-6 py-3.5"><div className="flex items-center gap-3"><Avatar name={cliente.nome} /><div className="min-w-0"><p className="truncate font-medium">{cliente.nome}</p><p className="mt-1 truncate text-xs text-muted">{cliente.email}</p></div></div></td>
                  <td className="px-4 py-3.5 whitespace-nowrap tabular-nums">{cliente.telefone ? formatarTelefone(cliente.telefone) : <span className="text-placeholder">Não informado</span>}</td>
                  <td className="px-4 py-3.5"><span className="inline-flex items-center gap-1.5 text-muted"><MapPin size={14} strokeWidth={1.6} />{cliente.endereco.cidade}/{cliente.endereco.uf}</span></td>
                  <td className="w-[1%] px-6 py-3.5"><Acoes cliente={cliente} onEditar={() => abrirFormulario(cliente)} onExcluir={() => abrirExclusao(cliente)} /></td>
                </motion.tr>
              ))}</tbody>
            </table>
            <ul className="flex flex-col md:hidden">{clientes.map((cliente, index) => (
              <motion.li key={cliente.id} {...animacaoLinha(index)} className="border-b border-line px-4 py-4 last:border-b-0">
                <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><Avatar name={cliente.nome} /><div className="min-w-0"><p className="truncate text-[13px] font-medium text-ink">{cliente.nome}</p><p className="mt-1 truncate text-xs text-muted">{cliente.email}</p></div></div><Acoes cliente={cliente} onEditar={() => abrirFormulario(cliente)} onExcluir={() => abrirExclusao(cliente)} /></div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted"><span className="inline-flex items-center gap-1.5"><Phone size={14} strokeWidth={1.6} />{cliente.telefone ? formatarTelefone(cliente.telefone) : 'Não informado'}</span><span className="inline-flex items-center gap-1.5"><MapPin size={14} strokeWidth={1.6} />{cliente.endereco.cidade}/{cliente.endereco.uf}</span></div>
              </motion.li>
            ))}</ul>
          </>}
        </div>
        {dados && clientes.length > 0 && <div className="border-t border-line px-4 py-3 sm:px-6"><Pagination page={dados.number} totalPages={dados.totalPages} totalItems={dados.totalElements} pageSize={dados.size} onChange={setPagina} /></div>}
      </Card>

      <ClienteFormModal key={formulario.chave} open={formulario.open} cliente={formulario.cliente} onClose={fecharFormulario} onSaved={handleSalvo} />
      <ConfirmDialog key={exclusao.chave} open={exclusao.open} title="Excluir cliente?" description={exclusao.cliente ? `“${exclusao.cliente.nome}” será removido da sua lista de clientes.` : ''} confirmLabel="Excluir cliente" onConfirm={handleExcluir} onClose={fecharExclusao} />
    </>
  )
}

export default ClientesPage
