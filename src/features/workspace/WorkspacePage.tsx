import { Columns3, Download, Plus, Search, SlidersHorizontal } from 'lucide-react'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import StatusBadge from '../../components/ui/StatusBadge'

const iconProps = { size: 16, strokeWidth: 1.6 }

function WorkspacePage() {
  return (
    <section>
      <p className="text-sm text-muted">Workspace</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">Workspace</h1>
      <p className="mt-2 text-muted">O painel com indicadores vai ser construído aqui.</p>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Button icon={<Download {...iconProps} />} iconHover="drop">
          Exportar agenda
        </Button>
        <Button icon={<Plus {...iconProps} />} iconHover="rotate">
          Novo agendamento
        </Button>
        <Button variant="secondary" icon={<SlidersHorizontal {...iconProps} />}>
          Filtros
        </Button>
        <Button variant="secondary" icon={<Columns3 {...iconProps} />}>
          Colunas
        </Button>
        <Button variant="ghost">Cancelar</Button>
        <Button disabled>Desativado</Button>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <StatusBadge tone="success">Confirmado</StatusBadge>
        <StatusBadge tone="warning" pulse>
          Aguardando
        </StatusBadge>
        <StatusBadge tone="danger">Cancelado</StatusBadge>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-8">
        <div className="flex items-center gap-3">
          <Avatar name="Nome Exemplo" />
          <div className="flex flex-col gap-1.5">
            <p className="text-[13px] leading-none font-normal text-ink">Nome Exemplo</p>
            <p className="text-xs leading-none text-muted">email@exemplo.com</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Avatar name="Pessoa Teste" size="sm" variant="outline" />
          <p className="text-xs leading-none font-normal text-muted">Pessoa Teste</p>
        </div>
      </div>

      <div className="mt-8 grid max-w-[360px] gap-5">
        <Input
          type="search"
          placeholder="Buscar por cliente, serviço ou data"
          aria-label="Buscar"
          icon={<Search {...iconProps} />}
        />
        <Input label="E-mail" type="email" placeholder="voce@empresa.com" hint="Use o e-mail cadastrado." />
      </div>
    </section>
  )
}

export default WorkspacePage