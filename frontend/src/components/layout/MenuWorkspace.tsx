import { useEffect, useRef, useState } from 'react'
import { Check, ChevronsUpDown, Settings2 } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router'
import { useConfiguracaoNegocio } from '../../lib/negocio'

function MenuWorkspace() {
  const negocio = useConfiguracaoNegocio()
  const reduceMotion = useReducedMotion()
  const [aberto, setAberto] = useState(false)
  const raiz = useRef<HTMLDivElement>(null)
  const botao = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!aberto) return

    const aoClicarFora = (evento: PointerEvent) => {
      if (!raiz.current?.contains(evento.target as Node)) setAberto(false)
    }

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key !== 'Escape') return
      setAberto(false)
      botao.current?.focus()
    }

    document.addEventListener('pointerdown', aoClicarFora)
    document.addEventListener('keydown', aoTeclar)

    return () => {
      document.removeEventListener('pointerdown', aoClicarFora)
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [aberto])

  return (
    <div ref={raiz} className="relative">
      <button
        ref={botao}
        type="button"
        aria-label="Abrir menu do workspace"
        aria-expanded={aberto}
        aria-controls="menu-workspace"
        onClick={() => setAberto((atual) => !atual)}
        className="flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <ChevronsUpDown size={16} strokeWidth={1.6} />
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            id="menu-workspace"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-[calc(100%+10px)] left-0 z-50 w-64 origin-top-left rounded-[10px] border border-line bg-surface p-1.5 shadow-[0_16px_40px_-12px_rgba(32,40,36,0.25)]"
          >
            <p className="px-2.5 pt-2 pb-1.5 text-[10px] font-medium tracking-wide text-muted uppercase">
              Workspace atual
            </p>
            <div className="flex items-center gap-2.5 rounded-md bg-surface-soft px-2.5 py-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#EEF3F8] text-xs font-semibold text-brand">
                {negocio.nome.trim().charAt(0).toLocaleUpperCase('pt-BR') || 'M'}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-ink">{negocio.nome}</span>
                <span className="mt-0.5 block truncate text-[11px] text-muted">
                  {negocio.email || 'Negócio ativo'}
                </span>
              </span>
              <Check aria-hidden="true" size={15} strokeWidth={1.8} className="shrink-0 text-accent" />
            </div>
            <div aria-hidden="true" className="my-1.5 h-px bg-line" />
            <Link
              to="/app/configuracoes-negocio"
              onClick={() => setAberto(false)}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-ink transition-colors hover:bg-surface-soft focus-visible:bg-surface-soft focus-visible:outline-none"
            >
              <Settings2 aria-hidden="true" size={15} strokeWidth={1.6} className="text-muted" />
              Configurações do negócio
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MenuWorkspace
