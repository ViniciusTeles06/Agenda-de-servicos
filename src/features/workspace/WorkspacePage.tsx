import { Columns3, Download, Plus, Search, SlidersHorizontal } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import StatusBadge from '../../components/ui/StatusBadge'

const iconProps = { size: 16, strokeWidth: 1.6 }

function WorkspacePage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Workspace', to: '/app' }, { label: 'Visão geral' }]}
        title="Visão geral"
        description="Acompanhe os indicadores, os próximos atendimentos e as atividades."
        actions={
          <>
            <Button icon={<Download {...iconProps} />} iconHover="drop">
              Exportar agenda
            </Button>
            <Button icon={<Plus {...iconProps} />} iconHover="rotate">
              Novo agendamento
            </Button>
          </>
        }
      />

      <Card className="mt-7 flex flex-col gap-8 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" icon={<SlidersHorizontal {...iconProps} />}>
            Filtros
          </Button>
          <Button variant="secondary" icon={<Columns3 {...iconProps} />}>
            Colunas
          </Button>
          <Button variant="ghost">Cancelar</Button>
          <Button disabled>Desativado</Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge tone="success">Confirmado</StatusBadge>
          <StatusBadge tone="warning" pulse>
            Aguardando
          </StatusBadge>
          <StatusBadge tone="danger">Cancelado</StatusBadge>
        </div>

        <div className="flex flex-wrap items-center gap-8">
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

        <div className="grid max-w-[360px] gap-5">
          <Input
            type="search"
            placeholder="Buscar por cliente, serviço ou data"
            aria-label="Buscar"
            icon={<Search {...iconProps} />}
          />
          <Input label="E-mail" type="email" placeholder="voce@empresa.com" hint="Use o e-mail cadastrado." />
        </div>
      </Card>
    </>
  )
}

export default WorkspacePage