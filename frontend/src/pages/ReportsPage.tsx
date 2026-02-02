import { useState } from 'react'
import { api } from '../api/client'

export default function ReportsPage() {
  const [occupancyDate, setOccupancyDate] = useState('')
  const [occupancy, setOccupancy] = useState<any[]>([])
  const [financialRange, setFinancialRange] = useState({ from: '', to: '' })
  const [financial, setFinancial] = useState<any[]>([])

  const loadOccupancy = async () => {
    const date = occupancyDate || new Date().toISOString().slice(0, 10)
    const data = await api.occupancyReport(date)
    setOccupancy(data)
  }

  const loadFinancial = async () => {
    if (!financialRange.from || !financialRange.to) return
    const data = await api.financialReport(financialRange.from, financialRange.to)
    setFinancial(data)
  }

  return (
    <section>
      <h2>Reports</h2>
      <div className="grid two">
        <div className="card form">
          <h3>Occupancy</h3>
          <input type="date" value={occupancyDate} onChange={(e) => setOccupancyDate(e.target.value)} />
          <button onClick={loadOccupancy}>Load</button>
          <ul>
            {occupancy.map((row) => (
              <li key={row.car_id}>
                {row.car}: {row.status} {row.expected_return_date ? `(ETA ${row.expected_return_date})` : ''}
              </li>
            ))}
          </ul>
        </div>
        <div className="card form">
          <h3>Financial</h3>
          <input type="date" value={financialRange.from} onChange={(e) => setFinancialRange({ ...financialRange, from: e.target.value })} />
          <input type="date" value={financialRange.to} onChange={(e) => setFinancialRange({ ...financialRange, to: e.target.value })} />
          <button onClick={loadFinancial}>Load</button>
          <ul>
            {financial.map((row) => (
              <li key={row.car_id}>
                Car #{row.car_id}: Revenue ${row.revenue}, Penalties ${row.penalties_total}, Net ${row.net_amount}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
