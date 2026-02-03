import { Navigate } from 'react-router-dom'
import type { ReactElement } from 'react'
import { useAuth } from './useAuth'
import { AccessDenied } from '../components/AccessDenied'
import { Spinner } from '../components/ui/Spinner'

type RequireAuthProps = {
  children: ReactElement
  roles?: string[]
}

export function RequireAuth({ children, roles }: RequireAuthProps) {
  const { user, loading } = useAuth()
  if (loading) {
    return <Spinner label="Loading your session" />
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (roles && !roles.includes(user.role)) {
    return <AccessDenied />
  }
  return children
}
