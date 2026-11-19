import { Bell, ChevronsUpDown } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Link, NavLink } from 'react-router'
import MenuConta from './MenuConta'

const navItems = [
  { to: '/app', label: 'Visão geral', end: true },
  { to: '/app/servicos', label: 'Serviços', end: false },
  { to: '/app/profissionais', label: 'Profissionais', end: false },
  { to: '/app/atividades', label: 'Atividades', end: false },
]

interface NavItemsProps {
  indicatorId: string
  className?: string
}

function NavItems({ indicatorId, className = '' }: NavItemsProps) {
  const reduceMotion = useReducedMotion()

  return (
    <nav aria-label="Navegação principal" className={className}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `relative flex items-center text-[13px] leading-none whitespace-nowrap transition-colors duration-200 ${
              isActive ? 'font-semibold text-brand' : 'font-normal text-muted hover:text-ink'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className="grid">
                <span className="col-start-1 row-start-1">{item.label}</span>
                <span aria-hidden="true" className="invisible col-start-1 row-start-1 font-semibold">
                  {item.label}
                </span>
              </span>
              {isActive && (
                <motion.span
                  layoutId={indicatorId}
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-accent"
                  transition={
                    reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }
                  }
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function Topbar() {
  const reduceMotion = useReducedMotion()

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-md">
      <div className="flex h-[75px] items-center px-4 sm:px-8 lg:px-12">
        <Link to="/app" className="font-brand text-[15px] leading-none font-normal text-brand">
          ServiceHub
        </Link>

        <span aria-hidden="true" className="mx-10 hidden h-6 w-px bg-line md:block" />

        <button
          type="button"
          aria-label="Trocar de workspace"
          className="mr-6 hidden size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-soft hover:text-ink md:flex"
        >
          <ChevronsUpDown size={16} strokeWidth={1.6} />
        </button>

        <NavItems indicatorId="topbar-indicator" className="hidden h-full items-stretch gap-7 md:flex" />

        <div className="ml-auto flex items-center gap-3">
          <motion.button
            type="button"
            aria-label="Notificações"
            whileHover={reduceMotion ? undefined : { rotate: [0, -14, 10, -6, 0] }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
            className="flex size-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-soft hover:text-ink"
          >
            <Bell size={18} strokeWidth={1.6} />
          </motion.button>

          <MenuConta />
        </div>
      </div>

      <NavItems
        indicatorId="topbar-indicator-mobile"
        className="flex h-11 items-stretch gap-6 overflow-x-auto px-4 sm:px-8 md:hidden"
      />
    </header>
  )
}

export default Topbar