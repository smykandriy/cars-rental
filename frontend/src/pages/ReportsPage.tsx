import { useMemo, useState } from 'react'
import { api, type FinancialRow, type OccupancyRow } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { Table } from '../components/ui/Table'
import { useToast } from '../components/ui/Toast'

const exportCsv = (filename: string, rows: Array<Record<string, string | number | null | undefined>>) => {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csvRows = [headers.join(',')]
  rows.forEach((row) => {
    csvRows.push(headers.map((header) => JSON.stringify(row[header] ?? '')).join(','))
  })
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10)
  const [occupancyDate, setOccupancyDate] = useState(today)
  const [occupancy, setOccupancy] = useState<OccupancyRow[]>([])
  const [financialRange, setFinancialRange] = useState({ from: today, to: today })
  const [financial, setFinancial] = useState<FinancialRow[]>([])
  const [loadingOccupancy, setLoadingOccupancy] = useState(false)
  const [loadingFinancial, setLoadingFinancial] = useState(false)
  const { notify } = useToast()

  const loadOccupancy = async () => {
    setLoadingOccupancy(true)
    try {
      const data = await api.occupancyReport(occupancyDate)
      setOccupancy(data)
    } catch {
      notify('Unable to load occupancy report', 'danger')
    } finally {
      setLoadingOccupancy(false)
    }
  }

  const loadFinancial = async () => {
    if (!financialRange.from || !financialRange.to) return
    setLoadingFinancial(true)
    try {
      const data = await api.financialReport(financialRange.from, financialRange.to)
      setFinancial(data)
    } catch {
      notify('Unable to load financial report', 'danger')
    } finally {
      setLoadingFinancial(false)
    }
  }

  const occupancySummary = useMemo(() => {
    const total = occupancy.length
    const available = occupancy.filter((row) => row.status === 'AVAILABLE').length
    const rented = occupancy.filter((row) => row.status === 'RENTED').length
    const maintenance = occupancy.filter((row) => row.status === 'MAINTENANCE').length
    return { total, available, rented, maintenance }
  }, [occupancy])

  const financialTotals = useMemo(() => {
    return financial.reduce(
      (acc, row) => {
        acc.revenue += Number(row.revenue)
        acc.penalties += Number(row.penalties_total)
        acc.net += Number(row.net_amount)
        return acc
      },
      { revenue: 0, penalties: 0, net: 0 }
    )
  }, [financial])

  return (
    <section>
      <PageHeader title="Reports" subtitle="Review occupancy and revenue performance." />
      <div className="grid two">
        <div className="card form">
          <h2 className="section-title">Occupancy report</h2>
          <FormField label="Report date" htmlFor="occupancy-date">
            <Input type="date" id="occupancy-date" value={occupancyDate} onChange={(e) => setOccupancyDate(e.target.value)} />
          </FormField>
          <div className="form-actions">
            <Button variant="secondary" onClick={loadOccupancy}>
              Load report
            </Button>
            <Button variant="ghost" onClick={() => exportCsv(`occupancy-${occupancyDate}.csv`, occupancy)}>
              Export CSV
            </Button>
          </div>
          {loadingOccupancy && <Spinner label="Loading occupancy report" />}
          {!loadingOccupancy && occupancy.length === 0 && (
            <EmptyState title="No data yet" description="Run the report to see occupancy status." />
          )}
          {occupancy.length > 0 && (
            <>
              <div className="summary-grid">
                <div>
                  <strong>Total cars</strong>
                  <p>{occupancySummary.total}</p>
                </div>
                <div>
                  <strong>Available</strong>
                  <p>{occupancySummary.available}</p>
                </div>
                <div>
                  <strong>Rented</strong>
                  <p>{occupancySummary.rented}</p>
                </div>
                <div>
                  <strong>Maintenance</strong>
                  <p>{occupancySummary.maintenance}</p>
                </div>
              </div>
              <Table caption="Occupancy table">
                <thead>
                  <tr>
                    <th scope="col">Car</th>
                    <th scope="col">Status</th>
                    <th scope="col">Expected return</th>
                  </tr>
                </thead>
                <tbody>
                  {occupancy.map((row) => (
                    <tr key={row.car_id}>
                      <td>{row.car}</td>
                      <td>{row.status}</td>
                      <td>{row.expected_return_date ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </div>
        <div className="card form">
          <h2 className="section-title">Financial report</h2>
          <div className="form-row">
            <FormField label="From" htmlFor="financial-from">
              <Input
                type="date"
                id="financial-from"
                value={financialRange.from}
                onChange={(e) => setFinancialRange({ ...financialRange, from: e.target.value })}
              />
            </FormField>
            <FormField label="To" htmlFor="financial-to">
              <Input
                type="date"
                id="financial-to"
                value={financialRange.to}
                onChange={(e) => setFinancialRange({ ...financialRange, to: e.target.value })}
              />
            </FormField>
          </div>
          <div className="form-actions">
            <Button variant="secondary" onClick={loadFinancial}>
              Load report
            </Button>
            <Button variant="ghost" onClick={() => exportCsv(`financial-${financialRange.from}-${financialRange.to}.csv`, financial)}>
              Export CSV
            </Button>
          </div>
          {loadingFinancial && <Spinner label="Loading financial report" />}
          {!loadingFinancial && financial.length === 0 && (
            <EmptyState title="No data yet" description="Run the report to view revenue totals." />
          )}
          {financial.length > 0 && (
            <>
              <Alert tone="info" title="Totals">
                Revenue ${financialTotals.revenue.toFixed(2)} · Penalties ${financialTotals.penalties.toFixed(2)} · Net $
                {financialTotals.net.toFixed(2)}
              </Alert>
              <Table caption="Financial table">
                <thead>
                  <tr>
                    <th scope="col">Car ID</th>
                    <th scope="col">Revenue</th>
                    <th scope="col">Penalties</th>
                    <th scope="col">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {financial.map((row) => (
                    <tr key={row.car_id}>
                      <td>{row.car_id}</td>
                      <td>${row.revenue}</td>
                      <td>${row.penalties_total}</td>
                      <td>${row.net_amount}</td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <strong>Totals</strong>
                    </td>
                    <td>${financialTotals.revenue.toFixed(2)}</td>
                    <td>${financialTotals.penalties.toFixed(2)}</td>
                    <td>${financialTotals.net.toFixed(2)}</td>
                  </tr>
                </tbody>
              </Table>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
