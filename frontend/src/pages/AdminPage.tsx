import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type Car, type Rental } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { Table } from '../components/ui/Table'
import { useToast } from '../components/ui/Toast'

export default function AdminPage() {
  const [cars, setCars] = useState<Car[]>([])
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const { notify } = useToast()

  useEffect(() => {
    let mounted = true
    Promise.all([api.cars(), api.rentals()])
      .then(([carsData, rentalsData]) => {
        if (mounted) {
          setCars(carsData)
          setRentals(rentalsData)
        }
      })
      .catch(() => {
        notify('Unable to load admin summary', 'danger')
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })
    return () => {
      mounted = false
    }
  }, [notify])

  const summary = useMemo(() => {
    const totalCars = cars.length
    const available = cars.filter((car) => car.status === 'AVAILABLE').length
    const activeRentals = rentals.filter((rental) => rental.status === 'ACTIVE').length
    return { totalCars, available, activeRentals }
  }, [cars, rentals])

  return (
    <section>
      <PageHeader title="Admin tools" subtitle="Quick access to fleet and rental operations." />
      {loading ? (
        <Spinner label="Loading admin overview" />
      ) : (
        <>
          <div className="summary-grid">
            <div>
              <strong>Total cars</strong>
              <p>{summary.totalCars}</p>
            </div>
            <div>
              <strong>Available cars</strong>
              <p>{summary.available}</p>
            </div>
            <div>
              <strong>Active rentals</strong>
              <p>{summary.activeRentals}</p>
            </div>
          </div>
          <div className="grid two">
            <div className="card">
              <h2 className="section-title">Quick actions</h2>
              <div className="stack">
                <Button as="link" to="/cars/new">
                  Add a new car
                </Button>
                <Button as="link" to="/rentals/new" variant="secondary">
                  Issue rental
                </Button>
                <Button as="link" to="/reports" variant="ghost">
                  View reports
                </Button>
              </div>
              <Alert tone="info" title="Role visibility">
                Only admins can access this overview. Staff users should use the rentals and cars pages.
              </Alert>
            </div>
            <div className="card">
              <h2 className="section-title">Recent rentals</h2>
              {rentals.length === 0 ? (
                <p>No rentals yet.</p>
              ) : (
                <Table caption="Recent rentals">
                  <thead>
                    <tr>
                      <th scope="col">Rental</th>
                      <th scope="col">Car</th>
                      <th scope="col">Status</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentals.slice(0, 5).map((rental) => (
                      <tr key={rental.id}>
                        <td>#{rental.id}</td>
                        <td>{rental.car_display ?? rental.car}</td>
                        <td>{rental.status}</td>
                        <td>
                          <Link to={`/rentals/${rental.id}`} className="link">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  )
}
