import { createContext, useContext, useEffect, useState } from 'react'
import { api, tokenStorage, type User } from '../api/client'

const AuthContext = createContext<{
  user: User | null
  logout: () => void
  setUser: (user: User | null) => void
  loading: boolean
}>({
  user: null,
  logout: () => undefined,
  setUser: () => undefined,
  loading: true
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = tokenStorage.get()
    if (token) {
      api
        .me()
        .then(setUser)
        .catch(() => tokenStorage.clear())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const logout = () => {
    tokenStorage.clear()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, logout, setUser, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
