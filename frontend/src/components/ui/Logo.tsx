import { useId } from 'react'
import {
  LOGO_BACKGROUND,
  LOGO_COLOR,
  LOGO_VIEWBOX,
  checkPath,
  documentDetailsPath,
  documentOutlinePath,
  peoplePath,
} from './logoPaths'

interface LogoProps {
  size?: number
  className?: string
  title?: string
}

function Logo({ size = 40, className, title = 'ServiceHub' }: LogoProps) {
  const clipId = useId()

  return (
    <svg
      width={size}
      height={size}
      viewBox={LOGO_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
    >
      <g clipPath={`url(#${clipId})`}>
        <rect
          width="123"
          height="123"
          transform="translate(-17.8041 50.1959)"
          fill={LOGO_BACKGROUND}
        />
        <path d={documentOutlinePath} fill={LOGO_COLOR} />
        <path d={documentDetailsPath} fill={LOGO_COLOR} />
        <path d={checkPath} fill={LOGO_COLOR} />
        <path d={peoplePath} fill={LOGO_COLOR} fillRule="evenodd" clipRule="evenodd" />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect
            width="172.362"
            height="172.362"
            fill="white"
            transform="translate(0.728908) rotate(0.242301)"
          />
        </clipPath>
      </defs>
    </svg>
  )
}

export default Logo