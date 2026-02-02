import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function CarsPage() {
  const [cars, setCars] = useState<any[]>([])

  useEffect(() => {
    api.cars().then(setCars).catch(() => setCars([]))
  }, [])

  return (
    <section>
      <h2>Fleet</h2>
      <div className="grid">
        {cars.map((car) => (
          <div className="card" key={car.id}>
            <h3>
              {car.brand} {car.model}
            </h3>
            <p>{car.car_class}</p>
            <p>Year: {car.year}</p>
            <p>Daily: ${car.base_daily_price}</p>
            <span className={`badge badge-${car.status?.toLowerCase()}`}>{car.status}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
