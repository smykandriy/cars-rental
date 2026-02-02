import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function AdminPage() {
  const [cars, setCars] = useState<any[]>([])
  const [rentals, setRentals] = useState<any[]>([])
  const [form, setForm] = useState({
    brand: '',
    model: '',
    car_class: '',
    year: '',
    base_daily_price: '',
    status: 'AVAILABLE'
  })

  const load = () => {
    api.cars().then(setCars)
    api.rentals().then(setRentals)
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    await api.createCar({
      brand: form.brand,
      model: form.model,
      car_class: form.car_class,
      year: Number(form.year),
      base_daily_price: form.base_daily_price,
      status: form.status
    })
    setForm({ brand: '', model: '', car_class: '', year: '', base_daily_price: '', status: 'AVAILABLE' })
    load()
  }

  return (
    <section>
      <h2>Admin</h2>
      <div className="grid two">
        <form className="card form" onSubmit={handleSubmit}>
          <h3>Manage Cars</h3>
          <input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          <input placeholder="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
          <input placeholder="Class" value={form.car_class} onChange={(e) => setForm({ ...form, car_class: e.target.value })} />
          <input placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          <input
            placeholder="Base daily price"
            value={form.base_daily_price}
            onChange={(e) => setForm({ ...form, base_daily_price: e.target.value })}
          />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="AVAILABLE">Available</option>
            <option value="RENTED">Rented</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
          <button type="submit">Add Car</button>
        </form>
        <div className="card">
          <h3>Cars</h3>
          <ul>
            {cars.map((car) => (
              <li key={car.id}>
                {car.brand} {car.model} - {car.status}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="card">
        <h3>Rentals Overview</h3>
        <ul>
          {rentals.map((rental) => (
            <li key={rental.id}>
              #{rental.id} - {rental.car_display} ({rental.status})
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
