import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '../routes/useAuth'

export default function Layout() {
  const { user, logout } = useAuth()
  return (
    <div>
      <header className="navbar">
        <Link to="/">Cars</Link>
        <Link to="/rentals">Rentals</Link>
        <Link to="/reports">Reports</Link>
        <Link to="/admin">Admin</Link>
        <div className="spacer" />
        {user ? (
          <button onClick={logout}>Logout</button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  )
}
