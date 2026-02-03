import type { ComponentProps } from 'react'

type TextareaProps = ComponentProps<'textarea'> & {
  hasError?: boolean
}

export function Textarea({ hasError, className, ...props }: TextareaProps) {
  return <textarea className={`textarea ${hasError ? 'textarea--error' : ''} ${className || ''}`.trim()} {...props} />
}
