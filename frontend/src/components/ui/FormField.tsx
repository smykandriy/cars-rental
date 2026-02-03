import { isValidElement, cloneElement } from 'react'
import type { ReactNode } from 'react'

type FormFieldProps = {
  label: string
  htmlFor: string
  hint?: string
  error?: string | null
  required?: boolean
  children: ReactNode
}

export function FormField({ label, htmlFor, hint, error, required, children }: FormFieldProps) {
  const hintId = hint ? `${htmlFor}-hint` : undefined
  const errorId = error ? `${htmlFor}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  const control = isValidElement(children)
    ? cloneElement(children, {
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined
      })
    : children

  return (
    <div className="form-field">
      <label htmlFor={htmlFor} className="form-field__label">
        {label}
        {required && (
          <span className="form-field__required" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="form-field__control">{control}</div>
      {hint && (
        <p id={hintId} className="form-field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="form-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
