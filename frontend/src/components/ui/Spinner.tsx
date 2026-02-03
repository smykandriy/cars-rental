type SpinnerProps = {
  label?: string
}

export function Spinner({ label = 'Loading' }: SpinnerProps) {
  return (
    <div className="spinner" role="status" aria-live="polite" aria-busy="true">
      <span className="spinner__icon" aria-hidden="true">
        ⏳
      </span>
      <span className="spinner__label">{label}</span>
    </div>
  )
}
