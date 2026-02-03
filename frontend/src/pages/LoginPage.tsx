import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, tokenStorage } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { useToast } from '../components/ui/Toast'
import { useAuth } from '../routes/useAuth'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const { notify } = useToast()

  const errors = useMemo(() => {
    const validation: Record<string, string> = {}
    if (!form.email.trim()) validation.email = 'Email is required.'
    if (!form.password.trim()) validation.password = 'Password is required.'
    return validation
  }, [form])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    if (Object.keys(errors).length > 0) {
      setError('Please enter your email and password.')
      return
    }
    try {
      const { access } = await api.login(form.email, form.password)
      tokenStorage.set(access)
      const me = await api.me()
      setUser(me)
      notify('Welcome back!', 'success')
      navigate('/')
    } catch {
      setError('Login failed. Check your credentials and try again.')
    }
  }

  return (
    <section>
      <PageHeader title="Sign in" subtitle="Access your account to manage rentals." />
      {error && (
        <Alert tone="danger" title="Authentication error">
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="card form" noValidate>
        <FormField label="Email" htmlFor="login-email" error={errors.email} required>
          <Input
            id="login-email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            hasError={Boolean(errors.email)}
            autoComplete="email"
          />
        </FormField>
        <FormField label="Password" htmlFor="login-password" error={errors.password} required>
          <Input
            id="login-password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            hasError={Boolean(errors.password)}
            autoComplete="current-password"
          />
        </FormField>
        <div className="form-actions">
          <Button type="submit">Sign in</Button>
        </div>
      </form>
    </section>
  )
}
