import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    password: '',
    address: '',
    phone: ''
  })
  const [message, setMessage] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)
    await api.register(form)
    setMessage('Registration complete. Please login.')
    setTimeout(() => navigate('/login'), 1000)
  }

  return (
    <section className="card">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Full name
          <input value={form.full_name} onChange={(e) => handleChange('full_name', e.target.value)} />
        </label>
        <label>
          Email
          <input value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} />
        </label>
        <label>
          Address
          <input value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
        </label>
        <label>
          Phone
          <input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
        </label>
        <button type="submit">Create account</button>
        {message && <p>{message}</p>}
      </form>
    </section>
  )
}
