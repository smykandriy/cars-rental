import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError, api, type Customer } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'

export default function CustomerDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useToast()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiMissing, setApiMissing] = useState(false)

  useEffect(() => {
    if (!id) return
    let mounted = true
    api
      .customer(Number(id))
      .then((data) => {
        if (mounted) {
          setCustomer(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (mounted) {
          if (err instanceof ApiError && err.status === 404) {
            setApiMissing(true)
          } else {
            setError('Unable to load customer.')
          }
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

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!customer) return
    try {
      const updated = await api.updateCustomer(customer.id, customer)
      setCustomer(updated)
      notify('Customer updated.', 'success')
    } catch {
      notify('Unable to update customer.', 'danger')
    }
  }

  if (loading) {
    return <Spinner label="Loading customer" />
  }

  if (apiMissing) {
    return (
      <Alert tone="warning" title="Customer API unavailable">
        This backend does not expose customer detail endpoints. Add <code>/api/customers/:id/</code> to enable editing.
      </Alert>
    )
  }

  if (error || !customer) {
    return (
      <div className="card">
        <p className="error">{error ?? 'Customer not found.'}</p>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    )
  }

  return (
    <section>
      <PageHeader title={customer.full_name} subtitle="Update profile details and contact info." />
      <form className="card form" onSubmit={handleSave}>
        <FormField label="Full name" htmlFor="customer-name">
          <Input
            id="customer-name"
            value={customer.full_name}
            onChange={(event) => setCustomer((prev) => (prev ? { ...prev, full_name: event.target.value } : prev))}
          />
        </FormField>
        <FormField label="Email" htmlFor="customer-email">
          <Input
            id="customer-email"
            type="email"
            value={customer.email}
            onChange={(event) => setCustomer((prev) => (prev ? { ...prev, email: event.target.value } : prev))}
          />
        </FormField>
        <FormField label="Address" htmlFor="customer-address" hint="Requires backend support to persist.">
          <Input
            id="customer-address"
            value={customer.address ?? ''}
            onChange={(event) => setCustomer((prev) => (prev ? { ...prev, address: event.target.value } : prev))}
          />
        </FormField>
        <FormField label="Phone" htmlFor="customer-phone" hint="Requires backend support to persist.">
          <Input
            id="customer-phone"
            value={customer.phone ?? ''}
            onChange={(event) => setCustomer((prev) => (prev ? { ...prev, phone: event.target.value } : prev))}
          />
        </FormField>
        <div className="form-actions">
          <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </section>
  )
}
