import type { ComponentProps } from 'react'

function Card({ className = '', ...props }: ComponentProps<'div'>) {
  return <div className={`rounded-[10px] border border-line bg-surface ${className}`} {...props} />
}

export default Card