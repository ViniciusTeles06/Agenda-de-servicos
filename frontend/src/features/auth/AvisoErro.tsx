import { CircleAlert } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

interface AvisoErroProps {
  mensagem: string
  tentativa: number
}

function AvisoErro({ mensagem, tentativa }: AvisoErroProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.p
      key={tentativa}
      role="alert"
      initial={reduceMotion ? false : { x: 0 }}
      animate={reduceMotion ? undefined : { x: [0, -7, 7, -4, 4, 0] }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex items-start gap-2 rounded-md bg-[#FBEDED] px-3 py-2.5 text-xs leading-snug text-danger"
    >
      <CircleAlert aria-hidden="true" size={15} strokeWidth={1.7} className="mt-px shrink-0" />
      {mensagem}
    </motion.p>
  )
}

export default AvisoErro