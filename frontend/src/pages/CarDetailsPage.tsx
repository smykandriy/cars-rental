import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, type Car } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { Modal } from '../components/ui/Modal'
import { Select } from '../components/ui/Select'
import { Spinner } from '../components/ui/Spinner'
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

export default function CarDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { notify } = useToast()
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [nextStatus, setNextStatus] = useState('AVAILABLE')

  useEffect(() => {
    if (!id) return
    let mounted = true
    api
      .car(Number(id))
      .then((data) => {
        if (mounted) {
          setCar(data)
          setNextStatus(data.status)
          setError(null)
        }
      })
      .catch(() => {
        if (mounted) {
          setError('Unable to load car details.')
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
  }, [id])

  const canManage = useMemo(() => user && user.role !== 'CUSTOMER', [user])

  const handleStatusUpdate = async () => {
    if (!car) return
    try {
      const updated = await api.updateCar(car.id, { status: nextStatus })
      setCar(updated)
      notify('Car status updated', 'success')
      setStatusModalOpen(false)
    } catch {
      notify('Unable to update status', 'danger')
    }
  }

  if (loading) {
    return <Spinner label="Loading car details" />
  }

  if (error || !car) {
    return (
      <div className="card">
        <p className="error">{error ?? 'Car not found.'}</p>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    )
  }

  return (
    <section>
      <PageHeader
        title={`${car.brand} ${car.model}`}
        subtitle={`Car ID ${car.id}`}
        actions={
          canManage ? (
            <Button as="link" to={`/cars/${car.id}/edit`}>
              Edit car
            </Button>
          ) : (
            <Button variant="ghost" as="link" to="/rentals">
              View rentals
            </Button>
          )
        }
      />
      <div className="card detail-grid">
        <div>
          <h2 className="section-title">Overview</h2>
          <p>
            <strong>Class:</strong> {car.car_class}
          </p>
          <p>
            <strong>Year:</strong> {car.year}
          </p>
          <p>
            <strong>Daily rate:</strong> ${car.base_daily_price}
          </p>
          <p>
            <strong>Status:</strong> <Badge tone={statusTone(car.status)}>{car.status}</Badge>
          </p>
        </div>
        <div>
          <h2 className="section-title">Actions</h2>
          {canManage ? (
            <>
              <p>Update availability or set the car in maintenance mode.</p>
              <Button variant="secondary" onClick={() => setStatusModalOpen(true)}>
                Change status
              </Button>
            </>
          ) : (
            <>
              <p>Need to book this car? Contact our staff or request a rental.</p>
              <Button variant="ghost" as="link" to="/rentals">
                Review rentals
              </Button>
            </>
          )}
        </div>
      </div>
      <Modal
        open={statusModalOpen}
        title="Confirm status change"
        description="Choose the new status for this car. This will affect availability in the rental flow."
        onClose={() => setStatusModalOpen(false)}
      >
        <FormField label="New status" htmlFor="car-status">
          <Select id="car-status" value={nextStatus} onChange={(event) => setNextStatus(event.target.value)}>
            <option value="AVAILABLE">Available</option>
            <option value="RENTED">Rented</option>
            <option value="MAINTENANCE">Maintenance</option>
          </Select>
        </FormField>
        <div className="modal__actions">
          <Button variant="ghost" onClick={() => setStatusModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleStatusUpdate}>Confirm update</Button>
        </div>
      </Modal>
      <div className="section">
        <Link to="/" className="link">
          ← Back to fleet
        </Link>
      </div>
    </section>
  )
}
