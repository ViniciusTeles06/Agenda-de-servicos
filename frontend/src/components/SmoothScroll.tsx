
import type { ReactNode } from 'react'
import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'

interface SmoothScrollProps {
  children: ReactNode
}

function SmoothScroll({ children }: SmoothScrollProps) {
  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        anchors: true,
        lerp: 0.1,
      }}
    >
      {children}
    </ReactLenis>
  )
}

export default SmoothScroll

