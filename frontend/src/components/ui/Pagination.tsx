import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onChange: (page: number) => void
}

function pagesToShow(page: number, totalPages: number) {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index)

  const start = Math.min(Math.max(page - 2, 0), totalPages - 5)
  return Array.from({ length: 5 }, (_, index) => start + index)
}

function Pagination({ page, totalPages, totalItems, pageSize, onChange }: PaginationProps) {
  if (totalItems === 0) return null

  const first = page * pageSize + 1
  const last = Math.min(totalItems, first + pageSize - 1)
  const arrowClass =
    'inline-flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-soft hover:text-ink disabled:pointer-events-none disabled:opacity-35'

  return (
    <nav aria-label="Paginação" className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted tabular-nums">
        {first}–{last} de {totalItems}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Página anterior" disabled={page === 0} onClick={() => onChange(page - 1)} className={arrowClass}>
            <ChevronLeft size={16} strokeWidth={1.6} />
          </button>

          {pagesToShow(page, totalPages).map((item) => (
            <button
              key={item}
              type="button"
              aria-label={`Página ${item + 1}`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onChange(item)}
              className={`inline-flex size-8 items-center justify-center rounded-md text-xs tabular-nums transition-colors ${
                item === page ? 'bg-brand font-medium text-white' : 'text-muted hover:bg-surface-soft hover:text-ink'
              }`}
            >
              {item + 1}
            </button>
          ))}

          <button
            type="button"
            aria-label="Próxima página"
            disabled={page >= totalPages - 1}
            onClick={() => onChange(page + 1)}
            className={arrowClass}
          >
            <ChevronRight size={16} strokeWidth={1.6} />
          </button>
        </div>
      )}
    </nav>
  )
}

export default Pagination