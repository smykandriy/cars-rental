import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CarsPage from './pages/CarsPage'
import RentalsPage from './pages/RentalsPage'
import ReportsPage from './pages/ReportsPage'
import AdminPage from './pages/AdminPage'
import { useAuth, AuthProvider } from './routes/useAuth'

const ProtectedRoute = ({ children, roles }: { children: JSX.Element; roles?: string[] }) => {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" />
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />
  }
  return children
}

const RoutesView = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<CarsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/rentals"
        element={
          <ProtectedRoute roles={["CUSTOMER", "STAFF", "ADMIN"]}>
            <RentalsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute roles={["STAFF", "ADMIN"]}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminPage />
          </ProtectedRoute>
        }
      />
    </Route>
  </Routes>
)

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RoutesView />
      </BrowserRouter>
    </AuthProvider>
  )
}
