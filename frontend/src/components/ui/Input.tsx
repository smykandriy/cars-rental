import type { ComponentProps } from 'react'

type InputProps = ComponentProps<'input'> & {
  hasError?: boolean
}

export function Input({ hasError, className, ...props }: InputProps) {
  return <input className={`input ${hasError ? 'input--error' : ''} ${className || ''}`.trim()} {...props} />
}
