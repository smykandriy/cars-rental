import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, api, type Car } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
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
  const [deleteTarget, setDeleteTarget] = useState<Car | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
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

  const handleDeleteCar = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await api.deleteCar(deleteTarget.id)
      setCars((prev) => prev.filter((car) => car.id !== deleteTarget.id))
      notify('Car deleted from the fleet.', 'success')
      setDeleteTarget(null)
    } catch (err) {
      let message = 'Unable to delete car. Please try again.'
      if (err instanceof ApiError && (err.status === 409 || err.status === 400)) {
        message = 'This car cannot be deleted because rentals are linked. Close or reassign rentals before deleting.'
      }
      setDeleteError(message)
      notify(message, 'danger')
    } finally {
      setDeleting(false)
    }
  }

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
                    <div className="table-actions">
                      <Link to={`/cars/${car.id}`} className="link">
                        View
                      </Link>
                      {user && user.role !== 'CUSTOMER' && (
                        <>
                          <Link to={`/cars/${car.id}/edit`} className="link">
                            Edit
                          </Link>
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => {
                              setDeleteTarget(car)
                              setDeleteError(null)
                            }}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
      <Modal
        open={Boolean(deleteTarget)}
        title="Delete car"
        description="Deleting a car removes it from the fleet. If cascade deletion is enabled, related rentals will be removed as well."
        onClose={() => {
          if (!deleting) {
            setDeleteTarget(null)
            setDeleteError(null)
          }
        }}
      >
        <p>
          {deleteTarget ? (
            <>
              You are about to delete <strong>{deleteTarget.brand}</strong> <strong>{deleteTarget.model}</strong>. This action
              cannot be undone. If deletion is blocked, close or reassign any active rentals tied to this car.
            </>
          ) : (
            'Select a car to delete.'
          )}
        </p>
        {deleteError && (
          <p className="error" role="alert">
            {deleteError}
          </p>
        )}
        <div className="modal__actions">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteCar} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete car'}
          </Button>
        </div>
      </Modal>
    </section>
  )
}
