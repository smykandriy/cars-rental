import type { ComponentProps } from 'react'

type SelectProps = ComponentProps<'select'> & {
  hasError?: boolean
}

export function Select({ hasError, className, ...props }: SelectProps) {
  return <select className={`select ${hasError ? 'select--error' : ''} ${className || ''}`.trim()} {...props} />
}
