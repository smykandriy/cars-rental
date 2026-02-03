import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, type Car, type Rental } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../routes/useAuth'
import { useToast } from '../components/ui/Toast'

const statusTone = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'info'
    case 'CLOSED':
      return 'success'
    case 'DRAFT':
      return 'warning'
    default:
      return 'neutral'
  }
}

const calculateDays = (start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diff = Math.max(endDate.getTime() - startDate.getTime(), 0)
  return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 1)
}

const LATE_FEE_PER_DAY = 50
const BAD_CONDITION_FEE = 100

export default function RentalDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { notify } = useToast()
  const [rental, setRental] = useState<Rental | null>(null)
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [returnForm, setReturnForm] = useState({
    actual_return_date: '',
    bad_condition: false
  })
  const [editForm, setEditForm] = useState({
    issue_date: '',
    expected_return_date: ''
  })

  const canManage = user && user.role !== 'CUSTOMER'

  useEffect(() => {
    if (!id) return
    let mounted = true
    Promise.all([api.rental(Number(id))])
      .then(([rentalData]) => {
        if (mounted) {
          setRental(rentalData)
          setEditForm({
            issue_date: rentalData.issue_date,
            expected_return_date: rentalData.expected_return_date
          })
          return api.car(rentalData.car)
        }
        return null
      })
      .then((carData) => {
        if (carData && mounted) {
          setCar(carData)
        }
      })
      .catch(() => {
        if (mounted) {
          setError('Unable to load rental details.')
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

  const estimatedTotal = useMemo(() => {
    if (!car || !rental) return null
    const endDate = rental.actual_return_date || rental.expected_return_date
    const days = calculateDays(rental.issue_date, endDate)
    const amount = Number(car.base_daily_price) * days
    return { days, amount }
  }, [car, rental])

  const handleReturn = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!rental) return
    try {
      const response = await api.returnRental(rental.id, {
        actual_return_date: returnForm.actual_return_date || undefined,
        bad_condition: returnForm.bad_condition
      })
      setRental(response.rental)
      notify(`Rental closed. Invoice total: $${response.invoice_total}`, 'success')
      setReturnModalOpen(false)
    } catch {
      notify('Unable to return rental.', 'danger')
    }
  }

  const returnEstimate = useMemo(() => {
    if (!rental) return null
    const actualDate = returnForm.actual_return_date || new Date().toISOString().slice(0, 10)
    const expected = rental.expected_return_date
    const lateDays = Math.max(
      Math.ceil((new Date(actualDate).getTime() - new Date(expected).getTime()) / (1000 * 60 * 60 * 24)),
      0
    )
    const lateFee = lateDays > 0 ? lateDays * LATE_FEE_PER_DAY : 0
    const badConditionFee = returnForm.bad_condition ? BAD_CONDITION_FEE : 0
    return {
      lateDays,
      lateFee,
      badConditionFee,
      total: lateFee + badConditionFee
    }
  }, [rental, returnForm.actual_return_date, returnForm.bad_condition])

  const handleEditDates = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!rental) return
    try {
      const updated = await api.updateRental(rental.id, {
        issue_date: editForm.issue_date,
        expected_return_date: editForm.expected_return_date
      })
      setRental(updated)
      notify('Rental dates updated.', 'success')
    } catch {
      notify('Unable to update rental dates.', 'danger')
    }
  }

  if (loading) {
    return <Spinner label="Loading rental details" />
  }

  if (error || !rental) {
    return (
      <div className="card">
        <p className="error">{error ?? 'Rental not found.'}</p>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    )
  }

  const canEditDates = canManage && rental.status === 'DRAFT'

  return (
    <section>
      <PageHeader
        title={`Rental #${rental.id}`}
        subtitle={`Status: ${rental.status}`}
        actions={
          canManage && rental.status !== 'CLOSED' ? (
            <Button variant="secondary" onClick={() => setReturnModalOpen(true)}>
              Return rental
            </Button>
          ) : null
        }
      />
      <div className="card detail-grid">
        <div>
          <h2 className="section-title">Details</h2>
          <p>
            <strong>Customer:</strong> {rental.customer_email ?? rental.customer}
          </p>
          <p>
            <strong>Car:</strong> {rental.car_display ?? rental.car}
          </p>
          <p>
            <strong>Issue date:</strong> {rental.issue_date}
          </p>
          <p>
            <strong>Expected return:</strong> {rental.expected_return_date}
          </p>
          <p>
            <strong>Actual return:</strong> {rental.actual_return_date ?? '—'}
          </p>
          <p>
            <strong>Status:</strong> <Badge tone={statusTone(rental.status)}>{rental.status}</Badge>
          </p>
        </div>
        <div>
          <h2 className="section-title">Pricing summary</h2>
          {estimatedTotal ? (
            <>
              <p>
                Estimated duration: {estimatedTotal.days} day(s)
              </p>
              <p>
                Estimated rental charge: ${estimatedTotal.amount.toFixed(2)}
              </p>
            </>
          ) : (
            <p>Pricing data unavailable without car details.</p>
          )}
          <Alert tone="info" title="Deposits and penalties">
            Deposit, penalties, and ledger details are finalized by the backend when the rental is closed.
          </Alert>
        </div>
      </div>
      <div className="section">
        {canEditDates ? (
          <form className="card form" onSubmit={handleEditDates}>
            <h2 className="section-title">Edit rental dates</h2>
            <FormField label="Issue date" htmlFor="edit-issue">
              <Input
                id="edit-issue"
                type="date"
                value={editForm.issue_date}
                onChange={(event) => setEditForm((prev) => ({ ...prev, issue_date: event.target.value }))}
              />
            </FormField>
            <FormField label="Expected return date" htmlFor="edit-expected">
              <Input
                id="edit-expected"
                type="date"
                value={editForm.expected_return_date}
                onChange={(event) => setEditForm((prev) => ({ ...prev, expected_return_date: event.target.value }))}
              />
            </FormField>
            <div className="form-actions">
              <Button type="submit">Save dates</Button>
            </div>
          </form>
        ) : (
          <Alert tone="warning" title="Date editing restricted">
            Rental dates can only be edited while the rental is in draft status.
          </Alert>
        )}
      </div>
      <Modal
        open={returnModalOpen}
        title="Return rental"
        description="Confirm the return date and any condition issues."
        onClose={() => setReturnModalOpen(false)}
      >
        <form className="form" onSubmit={handleReturn}>
          <FormField label="Actual return date" htmlFor="return-date" hint="Leave empty to use today's date.">
            <Input
              id="return-date"
              type="date"
              value={returnForm.actual_return_date}
              onChange={(event) => setReturnForm((prev) => ({ ...prev, actual_return_date: event.target.value }))}
            />
          </FormField>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={returnForm.bad_condition}
              onChange={(event) => setReturnForm((prev) => ({ ...prev, bad_condition: event.target.checked }))}
            />
            Report bad condition (adds a penalty)
          </label>
          {returnEstimate && (
            <Alert tone="info" title="Penalty estimate">
              Late days: {returnEstimate.lateDays} · Late fee: ${returnEstimate.lateFee} · Bad condition fee: $
              {returnEstimate.badConditionFee} · Estimated penalties total: ${returnEstimate.total}
            </Alert>
          )}
          <Alert tone="warning" title="Final totals">
            The backend calculates final totals and deposit refunds when the rental is closed.
          </Alert>
          <div className="modal__actions">
            <Button variant="ghost" type="button" onClick={() => setReturnModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Confirm return</Button>
          </div>
        </form>
      </Modal>
      <div className="section">
        <Link to="/rentals" className="link">
          ← Back to rentals
        </Link>
      </div>
    </section>
  )
}
