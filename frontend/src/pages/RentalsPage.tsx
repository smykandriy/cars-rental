import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../routes/useAuth'

export default function RentalsPage() {
  const [rentals, setRentals] = useState<any[]>([])
  const [form, setForm] = useState({
    customer: '',
    car: '',
    issue_date: '',
    expected_return_date: '',
    deposit_amount: ''
  })
  const [returnForm, setReturnForm] = useState({ rentalId: '', actual_return_date: '', bad_condition: false })
  const { user } = useAuth()

  const load = () => api.rentals().then(setRentals)

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    await api.createRental({
      customer: Number(form.customer),
      car: Number(form.car),
      issue_date: form.issue_date,
      expected_return_date: form.expected_return_date,
      deposit_amount: form.deposit_amount
    })
    setForm({ customer: '', car: '', issue_date: '', expected_return_date: '', deposit_amount: '' })
    load()
  }

  const handleReturn = async (event: React.FormEvent) => {
    event.preventDefault()
    await api.returnRental(Number(returnForm.rentalId), {
      actual_return_date: returnForm.actual_return_date || undefined,
      bad_condition: returnForm.bad_condition
    })
    setReturnForm({ rentalId: '', actual_return_date: '', bad_condition: false })
    load()
  }

  return (
    <section>
      <h2>Rentals</h2>
      {user && user.role !== 'CUSTOMER' && (
        <div className="grid two">
          <form className="card form" onSubmit={handleCreate}>
            <h3>Create Rental</h3>
            <input placeholder="Customer ID" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} />
            <input placeholder="Car ID" value={form.car} onChange={(e) => setForm({ ...form, car: e.target.value })} />
            <input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} />
            <input type="date" value={form.expected_return_date} onChange={(e) => setForm({ ...form, expected_return_date: e.target.value })} />
            <input placeholder="Deposit amount" value={form.deposit_amount} onChange={(e) => setForm({ ...form, deposit_amount: e.target.value })} />
            <button type="submit">Create</button>
          </form>
          <form className="card form" onSubmit={handleReturn}>
            <h3>Return Rental</h3>
            <input placeholder="Rental ID" value={returnForm.rentalId} onChange={(e) => setReturnForm({ ...returnForm, rentalId: e.target.value })} />
            <input type="date" value={returnForm.actual_return_date} onChange={(e) => setReturnForm({ ...returnForm, actual_return_date: e.target.value })} />
            <label className="checkbox">
              <input
                type="checkbox"
                checked={returnForm.bad_condition}
                onChange={(e) => setReturnForm({ ...returnForm, bad_condition: e.target.checked })}
              />
              Bad condition
            </label>
            <button type="submit">Close Rental</button>
          </form>
        </div>
      )}
      <div className="grid">
        {rentals.map((rental) => (
          <div className="card" key={rental.id}>
            <h3>Rental #{rental.id}</h3>
            <p>Car: {rental.car_display}</p>
            <p>Status: {rental.status}</p>
            <p>Issue: {rental.issue_date}</p>
            <p>Expected: {rental.expected_return_date}</p>
            <p>Actual: {rental.actual_return_date ?? '---'}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
