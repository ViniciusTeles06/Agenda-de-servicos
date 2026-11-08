interface ComingSoonPageProps {
  title: string
}

function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <section>
      <p className="text-sm text-muted">Workspace</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">{title}</h1>
      <p className="mt-2 text-muted">Esta página ainda está em construção.</p>
    </section>
  )
}

export default ComingSoonPage