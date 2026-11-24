import PageHeader from './PageHeader'

interface ComingSoonPageProps {
  title: string
}

function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <PageHeader
      breadcrumb={[{ label: 'Workspace', to: '/app' }, { label: title }]}
      title={title}
      description="Esta página ainda está em construção."
    />
  )
}

export default ComingSoonPage