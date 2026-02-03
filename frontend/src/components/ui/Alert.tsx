import type { ReactNode } from 'react'

type AlertProps = {
  children: ReactNode
  tone?: 'info' | 'success' | 'warning' | 'danger'
  title?: string
}

export function Alert({ children, tone = 'info', title }: AlertProps) {
  return (
    <div className={`alert alert--${tone}`} role={tone === 'danger' ? 'alert' : 'status'} aria-live="polite">
      {title && <p className="alert__title">{title}</p>}
      <div className="alert__content">{children}</div>
    </div>
  )
}
