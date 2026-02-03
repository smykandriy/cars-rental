import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, api, type Customer } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { Alert } from '../components/ui/Alert'
import { EmptyState } from '../components/ui/EmptyState'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { Table } from '../components/ui/Table'
import { useToast } from '../components/ui/Toast'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [apiMissing, setApiMissing] = useState(false)
  const { notify } = useToast()

  useEffect(() => {
    let mounted = true
    api
      .customers()
      .then((data) => {
        if (mounted) {
          setCustomers(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (mounted) {
          if (err instanceof ApiError && err.status === 404) {
            setApiMissing(true)
            setError(null)
          } else {
            setError('Unable to load customers.')
          }
          notify('Unable to load customers', 'warning')
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

  const filteredCustomers = useMemo(() => {
    if (!query) return customers
    return customers.filter((customer) =>
      `${customer.full_name} ${customer.email}`.toLowerCase().includes(query.toLowerCase())
    )
  }, [customers, query])

  return (
    <section>
      <PageHeader title="Customers" subtitle="Search and manage customer profiles." />
      {apiMissing && (
        <Alert tone="warning" title="Customer API unavailable">
          The backend does not currently expose <code>/api/customers/</code>. Add a customer listing endpoint to enable
          this view.
        </Alert>
      )}
      <div className="card">
        <FormField label="Search customers" htmlFor="customer-search">
          <Input
            id="customer-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or email"
          />
        </FormField>
      </div>
      <div className="section">
        {loading && <Spinner label="Loading customers" />}
        {error && <p className="error">{error}</p>}
        {!loading && filteredCustomers.length === 0 && !apiMissing && (
          <EmptyState title="No customers found" description="Try another search term." />
        )}
        {!loading && filteredCustomers.length > 0 && (
          <Table caption="Customer list">
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.full_name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.role}</td>
                  <td>
                    <Link to={`/customers/${customer.id}`} className="link">
                      View
                    </Link>
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
