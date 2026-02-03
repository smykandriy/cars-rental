import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from './components/AppShell'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CarsPage from './pages/CarsPage'
import CarDetailsPage from './pages/CarDetailsPage'
import CarFormPage from './pages/CarFormPage'
import RentalsPage from './pages/RentalsPage'
import RentalDetailsPage from './pages/RentalDetailsPage'
import RentalFormPage from './pages/RentalFormPage'
import ReportsPage from './pages/ReportsPage'
import CustomersPage from './pages/CustomersPage'
import CustomerDetailsPage from './pages/CustomerDetailsPage'
import AdminPage from './pages/AdminPage'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider } from './routes/useAuth'
import { RequireAuth } from './routes/RequireAuth'

const RoutesView = () => (
  <Routes>
    <Route element={<AppShell />}>
      <Route path="/" element={<CarsPage />} />
      <Route path="/cars/new" element={<RequireAuth roles={["STAFF", "ADMIN"]}><CarFormPage /></RequireAuth>} />
      <Route path="/cars/:id" element={<RequireAuth roles={["CUSTOMER", "STAFF", "ADMIN"]}><CarDetailsPage /></RequireAuth>} />
      <Route path="/cars/:id/edit" element={<RequireAuth roles={["STAFF", "ADMIN"]}><CarFormPage /></RequireAuth>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/rentals"
        element={
          <RequireAuth roles={["CUSTOMER", "STAFF", "ADMIN"]}>
            <RentalsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/rentals/new"
        element={
          <RequireAuth roles={["STAFF", "ADMIN"]}>
            <RentalFormPage />
          </RequireAuth>
        }
      />
      <Route
        path="/rentals/:id"
        element={
          <RequireAuth roles={["CUSTOMER", "STAFF", "ADMIN"]}>
            <RentalDetailsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/customers"
        element={
          <RequireAuth roles={["STAFF", "ADMIN"]}>
            <CustomersPage />
          </RequireAuth>
        }
      />
      <Route
        path="/customers/:id"
        element={
          <RequireAuth roles={["STAFF", "ADMIN"]}>
            <CustomerDetailsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/reports"
        element={
          <RequireAuth roles={["STAFF", "ADMIN"]}>
            <ReportsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAuth roles={["ADMIN"]}>
            <AdminPage />
          </RequireAuth>
        }
      />
    </Route>
  </Routes>
)

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <RoutesView />
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  )
}
