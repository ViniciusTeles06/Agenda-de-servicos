import { useEffect, useRef } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { animate, useReducedMotion } from 'motion/react'
import Card from '../../../components/ui/Card'

type Tom = 'brand' | 'success' | 'warning' | 'danger'

interface IndicadorProps {
  titulo: string
  valor: number
  anterior: number
  tom: Tom
  menorEhMelhor?: boolean
  atraso?: number
}

const pontos: Record<Tom, string> = {
  brand: 'bg-brand',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

function Indicador({ titulo, valor, anterior, tom, menorEhMelhor = false, atraso = 0 }: IndicadorProps) {
  const reduceMotion = useReducedMotion()
  const numeroRef = useRef<HTMLSpanElement>(null)
  const diferenca = valor - anterior
  const melhorou = menorEhMelhor ? diferenca < 0 : diferenca > 0

  useEffect(() => {
    const elemento = numeroRef.current
    if (!elemento) return

    if (reduceMotion) {
      elemento.textContent = String(valor)
      return
    }

    const controle = animate(0, valor, {
      duration: 1.1,
      delay: atraso,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (atual) => {
        elemento.textContent = String(Math.round(atual))
      },
    })

    return () => controle.stop()
  }, [valor, atraso, reduceMotion])

  return (
    <Card className="flex flex-col gap-4 p-5">
      <p className="flex items-center gap-2 text-xs text-muted">
        <span aria-hidden="true" className={`size-1.5 rounded-full ${pontos[tom]}`} />
        {titulo}
      </p>

      <div className="flex items-end justify-between gap-3">
        <span ref={numeroRef} className="text-[30px] leading-none font-semibold tracking-[-1px] text-ink tabular-nums">
          0
        </span>

        {diferenca === 0 ? (
          <span className="text-xs text-placeholder">
            igual<span className="hidden sm:inline"> a ontem</span>
          </span>
        ) : (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs tabular-nums ${
              melhorou ? 'bg-success-soft text-[#13861A]' : 'bg-[#FBEDED] text-danger'
            }`}
          >
            {diferenca > 0 ? <ArrowUpRight size={13} strokeWidth={2} /> : <ArrowDownRight size={13} strokeWidth={2} />}
            {Math.abs(diferenca)}
            <span className="hidden sm:inline">&nbsp;vs. ontem</span>
          </span>
        )}
      </div>
    </Card>
  )
}

export default Indicador