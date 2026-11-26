import { ArrowRight, CalendarDays, ChartNoAxesCombined, Clock3, UsersRound } from 'lucide-react'
import { Link } from 'react-router'
import Logo from '../../components/ui/Logo'

const recursos = [
  {
    icon: CalendarDays,
    title: 'Agendamentos Organizados',
    description: 'Acompanhe Horários, Status e Responsáveis sem perder nenhum detalhe.',
  },
  {
    icon: UsersRound,
    title: 'Equipe e Serviços',
    description: 'Gerencie seus profissionais, serviços e disponibilidade em um só lugar.',
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Visão do Negócio',
    description: 'Tenha uma visão clara da rotina e do que vem pela frente.',
  },
]

function LandingPage() {
  return (
    <main className="min-h-screen bg-surface">
      <header className="border-b border-line">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" aria-label="ServiceHub, página inicial" className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="font-brand text-[14px] font-medium text-brand">ServiceHub</span>
          </Link>

          <nav aria-label="Navegação do site" className="flex items-center gap-3 sm:gap-6">
            <a href="#recursos" className="hidden text-[13px] text-muted transition-colors hover:text-ink sm:block">
              Recursos
            </a>
            <Link to="/login" className="text-[13px] font-medium text-ink transition-colors hover:text-brand">
              Entrar
            </Link>
            <Link
              to="/cadastro"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-brand px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-brand-hover sm:px-4"
            >
              Criar conta
              <ArrowRight aria-hidden="true" size={15} strokeWidth={1.7} />
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1fr_0.92fr] lg:gap-16 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-soft px-3 py-1.5 text-[11px] font-medium text-accent">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            Gestão simples para o seu dia a dia
          </span>
          <h1 className="mt-6 max-w-[600px] text-[42px] leading-[1.1] font-semibold tracking-[-1.8px] text-ink sm:text-[54px]">
            Organize sua rotina.{' '}
            <span className="text-brand">Cuide do seu Negócio.</span>
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted sm:text-base">
            O ServiceHub reúne agendamentos, serviços e profissionais para você atender melhor e trabalhar com mais tranquilidade.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/cadastro"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-[13px] font-medium text-white shadow-[0_1px_2px_rgba(19,71,161,0.2)] transition-colors hover:bg-brand-hover"
            >
              Começar agora
              <ArrowRight aria-hidden="true" size={15} strokeWidth={1.7} />
            </Link>
            <Link
              to="/login"
              className="inline-flex h-10 items-center rounded-md border border-line bg-surface px-4 text-[13px] font-medium text-ink transition-colors hover:bg-surface-soft"
            >
              Já tenho uma Conta
            </Link>
          </div>
        </div>

        <div aria-label="Prévia do painel do ServiceHub" className="mx-auto w-full max-w-[490px]">
          <div className="overflow-hidden rounded-[10px] border border-line bg-surface shadow-[0_16px_48px_-24px_rgba(32,40,36,0.28)]">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="text-[11px] text-muted">Visão geral</p>
                <h2 className="mt-1 text-sm font-semibold text-ink">Resumo do dia</h2>
              </div>
              <span className="rounded-md bg-success-soft px-2.5 py-1 text-[10px] font-medium text-accent">Hoje</span>
            </div>

            <div className="grid grid-cols-3 gap-3 border-b border-line p-4">
              {[
                { label: 'Agendamentos', value: '12' },
                { label: 'Confirmados', value: '9' },
                { label: 'Aguardando', value: '3' },
              ].map((item) => (
                <div key={item.label} className="rounded-md border border-line bg-surface-soft p-3">
                  <p className="text-[9px] text-muted sm:text-[10px]">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold tabular-nums text-ink">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-ink">Próximos atendimentos</h3>
                <span className="text-[10px] text-muted">Agenda</span>
              </div>
              <ul className="mt-3 divide-y divide-line">
                {[
                  { horario: '09:30', nome: 'Mariana Alves', servico: 'Corte de cabelo', cor: 'bg-[#EAF2EC]' },
                  { horario: '10:15', nome: 'Pedro Henrique', servico: 'Barba', cor: 'bg-[#EEF1F8]' },
                  { horario: '11:00', nome: 'Juliana Costa', servico: 'Coloração', cor: 'bg-[#F8F2E5]' },
                ].map((atendimento) => (
                  <li key={atendimento.horario} className="flex items-center gap-3 py-3">
                    <span className="w-10 shrink-0 text-[10px] font-medium tabular-nums text-muted">
                      {atendimento.horario}
                    </span>
                    <span aria-hidden="true" className={`size-8 shrink-0 rounded-full ${atendimento.cor}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-medium text-ink">{atendimento.nome}</span>
                      <span className="mt-0.5 block truncate text-[10px] text-muted">{atendimento.servico}</span>
                    </span>
                    <Clock3 aria-hidden="true" size={14} strokeWidth={1.6} className="text-muted" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="recursos" className="border-t border-line bg-page/70">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold tracking-[0.1em] text-accent uppercase">Feito para sua rotina</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.6px] text-ink">
              Tudo em um só lugar, do seu jeito.
            </h2>
          </div>
          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {recursos.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-[10px] border border-line bg-surface p-5">
                <span className="flex size-9 items-center justify-center rounded-md bg-[#EEF3F8] text-brand">
                  <Icon aria-hidden="true" size={17} strokeWidth={1.7} />
                </span>
                <h3 className="mt-4 text-[13px] font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-[11px] text-muted sm:flex-row sm:px-8">
        <Link to="/" className="flex items-center gap-2">
          <Logo size={22} />
          <span className="font-brand text-[10px] text-brand">ServiceHub</span>
        </Link>
        <span>Gestão simples para serviços e agendamentos.</span>
      </footer>
    </main>
  )
}

export default LandingPage
