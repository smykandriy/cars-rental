import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, tokenStorage } from '../api/client'
import { useAuth } from '../routes/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    try {
      const { access } = await api.login(email, password)
      tokenStorage.set(access)
      const me = await api.me()
      setUser(me)
      navigate('/')
    } catch (err) {
      setError('Login failed')
    }
  }

  return (
    <section className="card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit">Sign in</button>
        {error && <p className="error">{error}</p>}
      </form>
    </section>
  )
}
