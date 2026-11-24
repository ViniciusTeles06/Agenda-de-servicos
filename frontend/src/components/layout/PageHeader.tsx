import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'

interface BreadcrumbItem {
  label: string
  to?: string
}

interface PageHeaderProps {
  breadcrumb: BreadcrumbItem[]
  title: string
  description?: string
  actions?: ReactNode
}

function PageHeader({ breadcrumb, title, description, actions }: PageHeaderProps) {
  return (
    <header>
      <nav aria-label="Caminho da página">
        <ol className="flex flex-wrap items-center gap-3 text-xs leading-[1.21]">
          {breadcrumb.map((item, index) => {
            const isCurrent = index === breadcrumb.length - 1

            return (
              <Fragment key={item.label}>
                {index > 0 && (
                  <li aria-hidden="true" className="text-muted">
                    <ChevronRight size={12} strokeWidth={1.6} />
                  </li>
                )}
                <li>
                  {isCurrent || !item.to ? (
                    <span aria-current={isCurrent ? 'page' : undefined} className={isCurrent ? 'text-ink' : 'text-muted'}>
                      {item.label}
                    </span>
                  ) : (
                    <Link to={item.to} className="text-muted transition-colors duration-200 hover:text-ink">
                      {item.label}
                    </Link>
                  )}
                </li>
              </Fragment>
            )
          })}
        </ol>
      </nav>

      <div className="mt-[25px] flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="text-[32px] leading-[1.21] font-semibold tracking-[-1px] text-ink">{title}</h1>
          {description && <p className="mt-[9px] text-sm leading-[1.21] text-muted">{description}</p>}
        </div>

        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </header>
  )
}

export default PageHeader