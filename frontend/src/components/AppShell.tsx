import { NavLink, Outlet } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useAuth } from '../routes/useAuth'
import { Button } from './ui/Button'

const navItems = [
  { to: '/', label: 'Cars', roles: ['CUSTOMER', 'STAFF', 'ADMIN'] },
  { to: '/rentals', label: 'Rentals', roles: ['CUSTOMER', 'STAFF', 'ADMIN'] },
  { to: '/customers', label: 'Customers', roles: ['STAFF', 'ADMIN'] },
  { to: '/reports', label: 'Reports', roles: ['STAFF', 'ADMIN'] },
  { to: '/admin', label: 'Admin Tools', roles: ['ADMIN'] }
]

export default function AppShell() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const allowedNav = useMemo(() => {
    if (!user) {
      return []
    }
    return navItems.filter((item) => item.roles.includes(user.role))
  }, [user])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="topbar">
        <div className="topbar__brand">
          <span className="brand-mark" aria-hidden="true">
            🚗
          </span>
          <div>
            <p className="brand-title">FleetOps</p>
            <p className="brand-subtitle">Car rental operations</p>
          </div>
        </div>
        <div className="topbar__actions">
          {user ? (
            <>
              <div className="user-chip" aria-live="polite">
                <span className="user-chip__name">{user.full_name}</span>
                <span className="user-chip__role">{user.role}</span>
              </div>
              <Button variant="ghost" onClick={logout}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" as="link" to="/login">
                Sign in
              </Button>
              <Button as="link" to="/register">
                Register
              </Button>
            </>
          )}
        </div>
        {user && (
          <Button
            className="topbar__menu"
            variant="ghost"
            aria-label="Toggle navigation"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            ☰
          </Button>
        )}
      </header>
      <div className="shell">
        {user && (
          <nav className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`} aria-label="Primary">
            <ul>
              {allowedNav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <main id="main-content" className="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
