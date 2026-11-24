import type { ReactNode } from 'react'
import { CalendarCheck2, CircleCheckBig, UsersRound } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { Variants } from 'motion/react'
import { Link } from 'react-router'
import Logo from '../../components/ui/Logo'
import { apiAtiva } from '../../lib/api'

interface AuthLayoutProps {
  titulo: string
  descricao: string
  rodape: ReactNode
  children: ReactNode
}

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

const destaques = [
  {
    icone: CalendarCheck2,
    titulo: 'Agenda sem conflitos',
    texto: 'Horários ocupados ficam bloqueados para novos agendamentos.',
  },
  {
    icone: UsersRound,
    titulo: 'Equipe organizada',
    texto: 'Cada profissional com seus serviços e horários de atendimento.',
  },
  {
    icone: CircleCheckBig,
    titulo: 'Status de relance',
    texto: 'Confirmados, aguardando e cancelados separados por cor.',
  },
]

function AuthLayout({ titulo, descricao, rodape, children }: AuthLayoutProps) {
  const reduceMotion = useReducedMotion()

  const grupo: Variants = {
    oculto: {},
    visivel: { transition: { staggerChildren: reduceMotion ? 0 : 0.07, delayChildren: 0.05 } },
  }

  const item: Variants = {
    oculto: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 },
    visivel: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
  }

  return (
    <div className="grid min-h-screen bg-surface lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-6 py-7 sm:px-12 lg:px-16">
        <Link to="/" className="self-start font-brand text-[15px] leading-none text-brand">
          ServiceHub
        </Link>

        <main className="flex flex-1 items-center justify-center py-12">
          <motion.div variants={grupo} initial="oculto" animate="visivel" className="w-full max-w-[360px]">
            <motion.h1
              variants={item}
              className="text-[32px] leading-[1.21] font-semibold tracking-[-1px] text-ink"
            >
              {titulo}
            </motion.h1>
            <motion.p variants={item} className="mt-[9px] text-sm leading-[1.21] text-muted">
              {descricao}
            </motion.p>

            <motion.div variants={item} className="mt-8">
              {children}
            </motion.div>

            {!apiAtiva('auth') && (
              <motion.p
                variants={item}
                className="mt-6 rounded-md border border-line bg-surface-soft px-3 py-2.5 text-xs leading-snug text-muted"
              >
                Modo demonstração: o back-end ainda não está ligado, então qualquer e-mail e senha válidos
                entram no painel.
              </motion.p>
            )}

            <motion.p variants={item} className="mt-8 text-center text-[13px] text-muted">
              {rodape}
            </motion.p>
          </motion.div>
        </main>
      </div>

      <aside className="relative hidden overflow-hidden border-l border-line bg-page lg:flex">
        <div className="m-auto flex w-full max-w-[440px] flex-col px-12 py-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
          >
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
            >
              <Logo size={112} />
            </motion.div>
          </motion.div>

          <motion.h2
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.25 }}
            className="mt-10 text-[28px] leading-[1.2] font-semibold tracking-[-0.8px] text-ink"
          >
            Seus horários, serviços e equipe no mesmo lugar.
          </motion.h2>

          <ul className="mt-9 flex flex-col gap-6">
            {destaques.map(({ icone: Icone, titulo: tituloDestaque, texto }, indice) => (
              <motion.li
                key={tituloDestaque}
                initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease, delay: 0.4 + indice * 0.1 }}
                className="flex gap-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-line bg-surface text-brand">
                  <Icone aria-hidden="true" size={18} strokeWidth={1.6} />
                </span>
                <span className="flex flex-col gap-1 pt-0.5">
                  <span className="text-sm font-medium text-ink">{tituloDestaque}</span>
                  <span className="text-[13px] leading-snug text-muted">{texto}</span>
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}

export default AuthLayout