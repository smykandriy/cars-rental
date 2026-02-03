import { Button } from './ui/Button'

export function AccessDenied() {
  return (
    <div className="card">
      <h2>Access denied</h2>
      <p>You do not have permission to view this page.</p>
      <Button variant="ghost" as="link" to="/">
        Return to dashboard
      </Button>
    </div>
  )
}
