import { createContext, useContext, useEffect, useState } from 'react'
import { api, tokenStorage, type User } from '../api/client'

const AuthContext = createContext<{
  user: User | null
  logout: () => void
  setUser: (user: User | null) => void
}>({
  user: null,
  logout: () => undefined,
  setUser: () => undefined
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const token = tokenStorage.get()
    if (token) {
      api
        .me()
        .then(setUser)
        .catch(() => tokenStorage.clear())
    }
  }, [])

  const logout = () => {
    tokenStorage.clear()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, logout, setUser }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
