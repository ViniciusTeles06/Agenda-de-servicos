import { useEffect, useId, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { Transition } from 'motion/react'
import Logo from './ui/Logo'
import {
  LOGO_COLOR,
  LOGO_VIEWBOX,
  checkPath,
  documentLinePaths,
  documentOutlinePath,
  documentRingPath,
  personLargePath,
  personSmallPath,
} from './ui/logoPaths'

interface SplashScreenProps {
  onFinish: () => void
}

const glide: [number, number, number, number] = [0.16, 1, 0.3, 1]
const smooth: [number, number, number, number] = [0.65, 0, 0.35, 1]

const SPLASH_DURATION = 4000
const JOIN_AT = 1.0
const FOLD_AT = JOIN_AT + 0.2
const LINES_AT = FOLD_AT + 0.6
const RING_AT = LINES_AT + 0.45
const CHECK_AT = RING_AT + 0.6

const STROKE = 7.69

const CORNER_OPEN = 'M59.07 60.45 L79.57 60.45 L79.57 80.95'
const CORNER_FOLDED = 'M59.07 60.45 L59.07 80.95 L79.57 80.95'

const TOP_EDGE_PATCH = 'M50 60.45 H59.07'
const RIGHT_EDGE_PATCH = 'M79.57 80.95 V88'

const CREASE_COVER_POINTS = '61.24,54.14 85.24,78.14 76.76,86.63 52.76,62.63'

const SHEET_CORNER_PATH = 'M79.57 118.06 V162.95 H55.49'

const RING_DRAW_PATH =
  'M78.29 127.07 A19.22 19.22 0 0 1 78.29 165.51 A19.22 19.22 0 0 1 78.29 127.07 A19.22 19.22 0 0 1 97.51 146.29'

const centerOrigin = {
  transformBox: 'fill-box' as const,
  transformOrigin: 'center',
}

function arrival(fromX: number, fromRotate: number, delay: number) {
  return {
    initial: { x: fromX, rotate: fromRotate, opacity: 0 },
    animate: { x: 0, rotate: 0, opacity: 1 },
    transition: {
      x: { duration: 1.3, ease: glide, delay },
      rotate: { duration: 1.3, ease: glide, delay },
      opacity: { duration: 0.4, delay },
    },
  }
}

function SplashScreen({ onFinish }: SplashScreenProps) {
  const reduceMotion = useReducedMotion()
  const [distance] = useState(() => window.innerWidth)

  const creaseMaskId = useId()
  const ringMaskId = useId()
  const checkMaskId = useId()

  useEffect(() => {
    const timer = window.setTimeout(onFinish, reduceMotion ? 700 : SPLASH_DURATION)
    return () => window.clearTimeout(timer)
  }, [onFinish, reduceMotion])

  const at = (delay: number, duration = 0.6): Transition => ({
    delay,
    duration,
    ease: glide,
  })

  const edge = {
    stroke: LOGO_COLOR,
    strokeWidth: STROKE,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  }

  const content = reduceMotion ? (
    <>
      <Logo size={224} />
      <p className="mt-6 text-4xl font-semibold tracking-tight text-brand">ServiceHub</p>
    </>
  ) : (
    <>
      <motion.div
        className="relative aspect-square w-48 sm:w-64 lg:w-80"
        animate={{ scale: [1, 1.04, 1] }}
        transition={at(JOIN_AT + 0.05, 0.6)}
      >
        <svg
          viewBox={LOGO_VIEWBOX}
          fill="none"
          overflow="visible"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        >
          <motion.circle
            cx="77.5"
            cy="112.7"
            r="75"
            stroke={LOGO_COLOR}
            strokeWidth="1.5"
            style={centerOrigin}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1.8, opacity: [0, 0.25, 0] }}
            transition={at(JOIN_AT, 1.4)}
          />
        </svg>

        <motion.div className="absolute inset-0" {...arrival(-distance, -8, 0.1)}>
          <svg
            viewBox={LOGO_VIEWBOX}
            fill="none"
            overflow="visible"
            aria-hidden="true"
            className="h-full w-full"
          >
            <defs>
              <mask id={creaseMaskId} maskUnits="userSpaceOnUse" x="-20" y="-20" width="220" height="220">
                <rect x="-20" y="-20" width="220" height="220" fill="white" />
                <motion.polygon
                  points={CREASE_COVER_POINTS}
                  fill="black"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: FOLD_AT + 0.25, duration: 0.5, ease: smooth }}
                />
              </mask>

              <mask id={ringMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="174" height="174">
                <motion.path
                  d={RING_DRAW_PATH}
                  stroke="white"
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    pathLength: { delay: RING_AT, duration: 0.7, ease: smooth },
                    opacity: { delay: RING_AT, duration: 0.01 },
                  }}
                />
              </mask>

              <mask id={checkMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="174" height="174">
                <motion.path
                  d="M70.6 146.29 L76.48 151.37 L85.98 142.44"
                  stroke="white"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    pathLength: { delay: CHECK_AT, duration: 0.4, ease: smooth },
                    opacity: { delay: CHECK_AT, duration: 0.01 },
                  }}
                />
              </mask>
            </defs>

            <path d={documentOutlinePath} fill={LOGO_COLOR} mask={`url(#${creaseMaskId})`} />

            <path d={TOP_EDGE_PATCH} {...edge} />
            <path d={RIGHT_EDGE_PATCH} {...edge} />

            <motion.path
              {...edge}
              initial={{ d: CORNER_OPEN }}
              animate={{ d: CORNER_FOLDED }}
              transition={{ delay: FOLD_AT, duration: 0.85, ease: smooth }}
            />

            <motion.path
              d={SHEET_CORNER_PATH}
              {...edge}
              strokeLinecap="round"
              initial={{ pathLength: 1 }}
              animate={{ pathLength: 0 }}
              transition={{ delay: RING_AT, duration: 0.6, ease: smooth }}
            />

            {documentLinePaths.map((line, index) => (
              <motion.path
                key={line}
                d={line}
                fill={LOGO_COLOR}
                style={{ originX: 0, originY: 0.5 }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={at(LINES_AT + index * 0.12, 0.55)}
              />
            ))}

            <path d={documentRingPath} fill={LOGO_COLOR} mask={`url(#${ringMaskId})`} />

            <motion.g
              style={centerOrigin}
              animate={{ scale: [1, 1.2, 1] }}
              transition={at(CHECK_AT + 0.35, 0.45)}
            >
              <path d={checkPath} fill={LOGO_COLOR} mask={`url(#${checkMaskId})`} />
            </motion.g>
          </svg>
        </motion.div>

        <motion.div className="absolute inset-0" {...arrival(distance, 8, 0.15)}>
          <svg
            viewBox={LOGO_VIEWBOX}
            fill="none"
            overflow="visible"
            aria-hidden="true"
            className="h-full w-full"
          >
            <path d={personLargePath} fill={LOGO_COLOR} fillRule="evenodd" clipRule="evenodd" />
          </svg>
        </motion.div>

        <motion.div className="absolute inset-0" {...arrival(distance, 12, 0.25)}>
          <svg
            viewBox={LOGO_VIEWBOX}
            fill="none"
            overflow="visible"
            aria-hidden="true"
            className="h-full w-full"
          >
            <path d={personSmallPath} fill={LOGO_COLOR} fillRule="evenodd" clipRule="evenodd" />
          </svg>
        </motion.div>
      </motion.div>

      <motion.p
        className="mt-8 text-3xl font-semibold tracking-tight text-brand sm:text-4xl lg:text-5xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={at(CHECK_AT - 0.2, 0.7)}
      >
        ServiceHub
      </motion.p>

      <div className="mt-6 h-0.5 w-32 overflow-hidden rounded-full bg-line sm:w-40">
        <motion.div
          className="h-full origin-left rounded-full bg-brand"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: JOIN_AT, duration: 2.6, ease: smooth }}
        />
      </div>
    </>
  )

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-white px-6"
      exit={{
        opacity: 0,
        scale: 1.03,
        filter: 'blur(8px)',
        transition: { duration: 0.55, ease: glide },
      }}
      role="status"
      aria-label="Carregando ServiceHub"
    >
      {content}
    </motion.div>
  )
}

export default SplashScreen