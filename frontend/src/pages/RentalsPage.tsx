import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type Rental } from '../api/client'
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

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: 'ALL',
    customer: '',
    car: '',
    dateFrom: '',
    dateTo: ''
  })
  const { user } = useAuth()
  const { notify } = useToast()

  const load = () => {
    setLoading(true)
    api
      .rentals({
        status: filters.status === 'ALL' ? undefined : filters.status,
        customer: filters.customer || undefined,
        car: filters.car || undefined,
        date_from: filters.dateFrom || undefined,
        date_to: filters.dateTo || undefined
      })
      .then((data) => {
        setRentals(data)
        setError(null)
      })
      .catch(() => {
        setError('Unable to load rentals. Please try again.')
        notify('Unable to load rentals', 'danger')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const filteredRentals = useMemo(() => {
    if (!user || user.role !== 'CUSTOMER') {
      return rentals
    }
    return rentals.filter((rental) => rental.customer === user.id)
  }, [rentals, user])

  return (
    <section>
      <PageHeader
        title={user?.role === 'CUSTOMER' ? 'My rentals' : 'Rentals'}
        subtitle="Track active rentals and complete returns."
        actions={
          user && user.role !== 'CUSTOMER' ? (
            <Button as="link" to="/rentals/new">
              Issue rental
            </Button>
          ) : null
        }
      />
      <div className="card">
        <h2 className="section-title">Filters</h2>
        <div className="filters-grid">
          <FormField label="Status" htmlFor="rental-status">
            <Select
              id="rental-status"
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="ALL">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
            </Select>
          </FormField>
          <FormField label="Customer ID" htmlFor="rental-customer">
            <Input
              id="rental-customer"
              value={filters.customer}
              onChange={(event) => setFilters((prev) => ({ ...prev, customer: event.target.value }))}
              placeholder="Customer ID"
              inputMode="numeric"
            />
          </FormField>
          <FormField label="Car ID" htmlFor="rental-car">
            <Input
              id="rental-car"
              value={filters.car}
              onChange={(event) => setFilters((prev) => ({ ...prev, car: event.target.value }))}
              placeholder="Car ID"
              inputMode="numeric"
            />
          </FormField>
          <FormField label="Issue date from" htmlFor="rental-date-from">
            <Input
              id="rental-date-from"
              type="date"
              value={filters.dateFrom}
              onChange={(event) => setFilters((prev) => ({ ...prev, dateFrom: event.target.value }))}
            />
          </FormField>
          <FormField label="Issue date to" htmlFor="rental-date-to">
            <Input
              id="rental-date-to"
              type="date"
              value={filters.dateTo}
              onChange={(event) => setFilters((prev) => ({ ...prev, dateTo: event.target.value }))}
            />
          </FormField>
          <div className="filters-actions">
            <Button variant="secondary" onClick={load}>
              Apply filters
            </Button>
          </div>
        </div>
      </div>
      <div className="section">
        {loading && <Spinner label="Loading rentals" />}
        {error && <p className="error">{error}</p>}
        {!loading && filteredRentals.length === 0 && (
          <EmptyState
            title="No rentals found"
            description="Adjust filters or issue a new rental."
            action={
              user && user.role !== 'CUSTOMER' ? (
                <Button as="link" to="/rentals/new" variant="secondary">
                  Issue rental
                </Button>
              ) : null
            }
          />
        )}
        {!loading && filteredRentals.length > 0 && (
          <Table caption="Rental list">
            <thead>
              <tr>
                <th scope="col">Rental</th>
                <th scope="col">Car</th>
                <th scope="col">Customer</th>
                <th scope="col">Issue date</th>
                <th scope="col">Expected return</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRentals.map((rental) => (
                <tr key={rental.id}>
                  <td>#{rental.id}</td>
                  <td>{rental.car_display ?? rental.car}</td>
                  <td>{rental.customer_email ?? rental.customer}</td>
                  <td>{rental.issue_date}</td>
                  <td>{rental.expected_return_date}</td>
                  <td>
                    <Badge tone={statusTone(rental.status)}>{rental.status}</Badge>
                  </td>
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
    </section>
  )
}
