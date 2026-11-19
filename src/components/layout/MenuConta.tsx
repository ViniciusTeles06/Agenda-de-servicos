import { useEffect, useRef, useState } from 'react'
import { LogOut } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useNavigate } from 'react-router'
import { encerrarSessao, useSessao } from '../../lib/sessao'
import Avatar from '../ui/Avatar'

function MenuConta() {
  const sessao = useSessao()
  const navigate = useNavigate()
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

  const nome = sessao?.usuario.nome ?? 'Usuário'

  function sair() {
    setAberto(false)
    encerrarSessao()
    navigate('/login', { replace: true })
  }

  return (
    <div ref={raiz} className="relative">
      <button
        ref={botao}
        type="button"
        aria-label="Abrir menu da conta"
        aria-haspopup="menu"
        aria-expanded={aberto}
        onClick={() => setAberto((atual) => !atual)}
        className="rounded-full transition-shadow duration-200 hover:shadow-[0_0_0_3px_#E4E8E3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Avatar name={nome} />
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            role="menu"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-[calc(100%+10px)] right-0 z-50 w-60 origin-top-right rounded-[10px] border border-line bg-surface p-1.5 shadow-[0_16px_40px_-12px_rgba(32,40,36,0.25)]"
          >
            <div className="flex items-center gap-3 px-2.5 py-2.5">
              <Avatar name={nome} />
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-[13px] leading-none text-ink">{nome}</span>
                <span className="truncate text-xs leading-none text-muted">{sessao?.usuario.email}</span>
              </div>
            </div>

            <div aria-hidden="true" className="my-1 h-px bg-line" />

            <button
              type="button"
              role="menuitem"
              onClick={sair}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-ink transition-colors hover:bg-surface-soft focus-visible:bg-surface-soft focus-visible:outline-none"
            >
              <LogOut aria-hidden="true" size={15} strokeWidth={1.6} className="text-muted" />
              Sair
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MenuConta