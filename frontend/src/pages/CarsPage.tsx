import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type Car } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Spinner } from '../components/ui/Spinner'
import { Table } from '../components/ui/Table'
import { useAuth } from '../routes/useAuth'
import { useToast } from '../components/ui/Toast'

const statusTone = (status: string) => {
  switch (status) {
    case 'AVAILABLE':
      return 'success'
    case 'RENTED':
      return 'danger'
    case 'MAINTENANCE':
      return 'warning'
    default:
      return 'neutral'
  }
}

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({ query: '', status: 'ALL', carClass: 'ALL' })
  const { user } = useAuth()
  const { notify } = useToast()

  useEffect(() => {
    let mounted = true
    api
      .cars()
      .then((data) => {
        if (mounted) {
          setCars(data)
          setError(null)
        }
      })
      .catch(() => {
        if (mounted) {
          setError('Unable to load cars. Please try again.')
          notify('Unable to load cars', 'danger')
        }
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

  const classes = useMemo(() => Array.from(new Set(cars.map((car) => car.car_class))).sort(), [cars])

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const matchesQuery =
        `${car.brand} ${car.model}`.toLowerCase().includes(filters.query.toLowerCase()) ||
        car.car_class.toLowerCase().includes(filters.query.toLowerCase())
      const matchesStatus = filters.status === 'ALL' || car.status === filters.status
      const matchesClass = filters.carClass === 'ALL' || car.car_class === filters.carClass
      return matchesQuery && matchesStatus && matchesClass
    })
  }, [cars, filters])

  return (
    <section>
      <PageHeader
        title="Cars"
        subtitle="Manage fleet availability, pricing, and details."
        actions={
          user && user.role !== 'CUSTOMER' ? (
            <Button as="link" to="/cars/new">
              Add car
            </Button>
          ) : null
        }
      />
      <div className="card">
        <h2 className="section-title">Filters</h2>
        <div className="filters-grid">
          <FormField label="Search" htmlFor="car-search" hint="Search by brand, model, or class.">
            <Input
              id="car-search"
              value={filters.query}
              onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
              placeholder="e.g. Toyota"
            />
          </FormField>
          <FormField label="Status" htmlFor="car-status">
            <Select
              id="car-status"
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="ALL">All statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="RENTED">Rented</option>
              <option value="MAINTENANCE">Maintenance</option>
            </Select>
          </FormField>
          <FormField label="Class" htmlFor="car-class">
            <Select
              id="car-class"
              value={filters.carClass}
              onChange={(event) => setFilters((prev) => ({ ...prev, carClass: event.target.value }))}
            >
              <option value="ALL">All classes</option>
              {classes.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </div>
      <div className="section">
        {loading && <Spinner label="Loading fleet" />}
        {error && <p className="error">{error}</p>}
        {!loading && filteredCars.length === 0 && (
          <EmptyState
            title="No cars found"
            description="Try adjusting your filters or add a new car to the fleet."
            action={
              user && user.role !== 'CUSTOMER' ? (
                <Button as="link" to="/cars/new" variant="secondary">
                  Add car
                </Button>
              ) : null
            }
          />
        )}
        {!loading && filteredCars.length > 0 && (
          <Table caption="Fleet list">
            <thead>
              <tr>
                <th scope="col">Car</th>
                <th scope="col">Class</th>
                <th scope="col">Year</th>
                <th scope="col">Daily rate</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCars.map((car) => (
                <tr key={car.id}>
                  <td>
                    <Link to={`/cars/${car.id}`} className="link">
                      {car.brand} {car.model}
                    </Link>
                  </td>
                  <td>{car.car_class}</td>
                  <td>{car.year}</td>
                  <td>${car.base_daily_price}</td>
                  <td>
                    <Badge tone={statusTone(car.status)}>{car.status}</Badge>
                  </td>
                  <td>
                    <Link to={`/cars/${car.id}`} className="link">
                      View
                    </Link>
                    {user && user.role !== 'CUSTOMER' && (
                      <>
                        <span className="divider" aria-hidden="true">
                          •
                        </span>
                        <Link to={`/cars/${car.id}/edit`} className="link">
                          Edit
                        </Link>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </section>
  )
}
