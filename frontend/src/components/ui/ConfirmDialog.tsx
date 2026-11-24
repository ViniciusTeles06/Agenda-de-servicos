import { useState } from 'react'
import Button from './Button'
import Modal from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => Promise<void>
  onClose: () => void
}

function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onClose }: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    setLoading(true)
    setError('')

    try {
      await onConfirm()
    } catch (falha) {
      setError(falha instanceof Error ? falha.message : 'Não foi possível concluir. Tente de novo.')
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      width="sm"
      closeDisabled={loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading} data-autofocus>
            Voltar
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {error && (
        <p role="alert" className="rounded-md border border-[#F1C9CA] bg-[#FBEDED] px-3.5 py-2.5 text-xs leading-snug text-danger">
          {error}
        </p>
      )}
    </Modal>
  )
}

export default ConfirmDialog