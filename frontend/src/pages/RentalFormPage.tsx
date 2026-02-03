import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { useToast } from '../components/ui/Toast'

export default function RentalFormPage() {
  const [form, setForm] = useState({
    customer: '',
    car: '',
    issue_date: '',
    expected_return_date: '',
    deposit_amount: ''
  })
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { notify } = useToast()

  const errors = useMemo(() => {
    const validation: Record<string, string> = {}
    if (!form.customer.trim()) validation.customer = 'Customer ID is required.'
    if (!form.car.trim()) validation.car = 'Car ID is required.'
    if (!form.issue_date) validation.issue_date = 'Issue date is required.'
    if (!form.expected_return_date) validation.expected_return_date = 'Expected return date is required.'
    if (!form.deposit_amount.trim()) validation.deposit_amount = 'Deposit amount is required.'
    return validation
  }, [form])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (Object.keys(errors).length > 0) {
      setError('Please fix the errors before submitting.')
      return
    }
    setError(null)
    try {
      await api.createRental({
        customer: Number(form.customer),
        car: Number(form.car),
        issue_date: form.issue_date,
        expected_return_date: form.expected_return_date,
        deposit_amount: form.deposit_amount
      })
      notify('Rental issued successfully.', 'success')
      navigate('/rentals')
    } catch {
      setError('Unable to create rental. Confirm the customer and car IDs.')
    }
  }

  return (
    <section>
      <PageHeader title="Issue rental" subtitle="Create a new rental and hold the deposit." />
      {error && (
        <Alert tone="danger" title="Form error">
          {error}
        </Alert>
      )}
      <form className="card form" onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <FormField label="Customer ID" htmlFor="rental-customer" error={errors.customer} required>
            <Input
              id="rental-customer"
              value={form.customer}
              onChange={(event) => setForm((prev) => ({ ...prev, customer: event.target.value }))}
              hasError={Boolean(errors.customer)}
              inputMode="numeric"
            />
          </FormField>
          <FormField label="Car ID" htmlFor="rental-car" error={errors.car} required>
            <Input
              id="rental-car"
              value={form.car}
              onChange={(event) => setForm((prev) => ({ ...prev, car: event.target.value }))}
              hasError={Boolean(errors.car)}
              inputMode="numeric"
            />
          </FormField>
        </div>
        <div className="form-row">
          <FormField label="Issue date" htmlFor="rental-issue" error={errors.issue_date} required>
            <Input
              id="rental-issue"
              type="date"
              value={form.issue_date}
              onChange={(event) => setForm((prev) => ({ ...prev, issue_date: event.target.value }))}
              hasError={Boolean(errors.issue_date)}
            />
          </FormField>
          <FormField label="Expected return date" htmlFor="rental-expected" error={errors.expected_return_date} required>
            <Input
              id="rental-expected"
              type="date"
              value={form.expected_return_date}
              onChange={(event) => setForm((prev) => ({ ...prev, expected_return_date: event.target.value }))}
              hasError={Boolean(errors.expected_return_date)}
            />
          </FormField>
        </div>
        <FormField
          label="Deposit amount"
          htmlFor="rental-deposit"
          error={errors.deposit_amount}
          hint="The deposit will be held until the rental is closed."
          required
        >
          <Input
            id="rental-deposit"
            value={form.deposit_amount}
            onChange={(event) => setForm((prev) => ({ ...prev, deposit_amount: event.target.value }))}
            hasError={Boolean(errors.deposit_amount)}
            inputMode="decimal"
          />
        </FormField>
        <Alert tone="info" title="Double booking checks">
          The backend will prevent double booking. Please confirm the car is available before issuing the rental.
        </Alert>
        <div className="form-actions">
          <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">Issue rental</Button>
        </div>
      </form>
    </section>
  )
}
