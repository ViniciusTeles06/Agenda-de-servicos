
import { motion } from 'motion/react'

function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16 text-white">
      <motion.section
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.8,
          ease: 'easeOut',
        }}
        whileHover={{ y: -4 }}
        className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-12"
      >
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xs font-semibold tracking-[0.22em] text-blue-400"
        >
          PLATAFORMA DE GESTÃO
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl"
        >
          Service<span className="text-blue-400">Hub</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-4 max-w-lg text-sm leading-7 text-white/60 sm:text-base"
        >
          Estamos preparando a estrutura da plataforma para oferecer uma
          experiência completa de gestão de serviços e agendamentos.
        </motion.p>

        <div className="mt-8 h-px w-full bg-white/10" />

        <p className="mt-5 text-xs text-white/40">
          Ambiente de desenvolvimento · Front-end
        </p>
      </motion.section>
    </main>
  )
}

export default App
