import { useState } from 'react'
import { getInitials } from '../../lib/initials'

type AvatarSize = 'sm' | 'md' | 'lg'
type AvatarVariant = 'filled' | 'outline'

interface AvatarProps {
  name: string
  src?: string
  size?: AvatarSize
  variant?: AvatarVariant
  className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'size-6 text-[9px]',
  md: 'size-[34px] text-[11px]',
  lg: 'size-10 text-[13px]',
}

const variantClasses: Record<AvatarVariant, string> = {
  filled: 'bg-avatar text-avatar-ink',
  outline: 'border border-line bg-surface-soft text-muted',
}

function Avatar({ name, src, size = 'md', variant = 'filled', className = '' }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(src) && !imageFailed

  return (
    <span
      role="img"
      aria-label={name}
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full leading-none font-semibold select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          className="size-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  )
}

export default Avatar