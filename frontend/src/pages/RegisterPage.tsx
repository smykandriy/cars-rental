import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { useToast } from '../components/ui/Toast'

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    password: '',
    address: '',
    phone: ''
  })
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { notify } = useToast()

  const errors = useMemo(() => {
    const validation: Record<string, string> = {}
    if (!form.full_name.trim()) validation.full_name = 'Full name is required.'
    if (!form.email.trim()) validation.email = 'Email is required.'
    if (!form.password.trim()) validation.password = 'Password is required.'
    if (!form.address.trim()) validation.address = 'Address is required.'
    if (!form.phone.trim()) validation.phone = 'Phone is required.'
    return validation
  }, [form])

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)
    setError(null)
    if (Object.keys(errors).length > 0) {
      setError('Please complete all required fields.')
      return
    }
    try {
      await api.register(form)
      setMessage('Registration complete. Please sign in.')
      notify('Account created successfully.', 'success')
      setTimeout(() => navigate('/login'), 1200)
    } catch {
      setError('Unable to register. Please try again.')
    }
  }

  return (
    <section>
      <PageHeader title="Create account" subtitle="Register as a new customer." />
      {error && (
        <Alert tone="danger" title="Registration error">
          {error}
        </Alert>
      )}
      {message && (
        <Alert tone="success" title="Success">
          {message}
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="card form" noValidate>
        <FormField label="Full name" htmlFor="register-name" error={errors.full_name} required>
          <Input id="register-name" value={form.full_name} onChange={(e) => handleChange('full_name', e.target.value)} />
        </FormField>
        <FormField label="Email" htmlFor="register-email" error={errors.email} required>
          <Input id="register-email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
        </FormField>
        <FormField label="Password" htmlFor="register-password" error={errors.password} required>
          <Input
            id="register-password"
            type="password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
          />
        </FormField>
        <FormField label="Address" htmlFor="register-address" error={errors.address} required>
          <Input id="register-address" value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
        </FormField>
        <FormField label="Phone" htmlFor="register-phone" error={errors.phone} required>
          <Input id="register-phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
        </FormField>
        <div className="form-actions">
          <Button type="submit">Create account</Button>
        </div>
      </form>
    </section>
  )
}
