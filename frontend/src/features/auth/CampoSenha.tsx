import { useState } from 'react'
import type { ComponentProps } from 'react'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import Input from '../../components/ui/Input'

type CampoSenhaProps = Omit<ComponentProps<typeof Input>, 'type' | 'icon' | 'trailing'>

function CampoSenha(props: CampoSenhaProps) {
  const [visivel, setVisivel] = useState(false)

  return (
    <Input
      {...props}
      type={visivel ? 'text' : 'password'}
      icon={<LockKeyhole size={16} strokeWidth={1.6} />}
      trailing={
        <button
          type="button"
          onClick={() => setVisivel((atual) => !atual)}
          aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visivel}
          className="flex size-7 items-center justify-center rounded text-muted transition-colors hover:bg-surface-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
        >
          {visivel ? <EyeOff size={15} strokeWidth={1.6} /> : <Eye size={15} strokeWidth={1.6} />}
        </button>
      }
    />
  )
}

export default CampoSenha