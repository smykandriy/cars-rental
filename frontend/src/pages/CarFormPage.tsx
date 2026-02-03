import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, type Car } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Spinner } from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'

const emptyForm = {
  brand: '',
  model: '',
  car_class: '',
  year: '',
  base_daily_price: '',
  status: 'AVAILABLE'
}

export default function CarFormPage() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(isEditing)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { notify } = useToast()

  useEffect(() => {
    if (!isEditing || !id) return
    api
      .car(Number(id))
      .then((car) => {
        setForm({
          brand: car.brand,
          model: car.model,
          car_class: car.car_class,
          year: String(car.year),
          base_daily_price: car.base_daily_price,
          status: car.status
        })
      })
      .catch(() => setError('Unable to load car information.'))
      .finally(() => setLoading(false))
  }, [id, isEditing])

  const errors = useMemo(() => {
    const validation: Record<string, string> = {}
    if (!form.brand.trim()) validation.brand = 'Brand is required.'
    if (!form.model.trim()) validation.model = 'Model is required.'
    if (!form.car_class.trim()) validation.car_class = 'Class is required.'
    if (!form.year.trim() || Number.isNaN(Number(form.year))) validation.year = 'Enter a valid year.'
    if (!form.base_daily_price.trim()) validation.base_daily_price = 'Enter the daily price.'
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
      const payload: Omit<Car, 'id'> = {
        brand: form.brand,
        model: form.model,
        car_class: form.car_class,
        year: Number(form.year),
        base_daily_price: form.base_daily_price,
        status: form.status
      }
      if (isEditing && id) {
        await api.updateCar(Number(id), payload)
        notify('Car updated successfully.', 'success')
      } else {
        await api.createCar(payload)
        notify('Car added to fleet.', 'success')
      }
      navigate('/')
    } catch {
      setError('Unable to save car details. Please try again.')
    }
  }

  if (loading) {
    return <Spinner label="Loading car" />
  }

  return (
    <section>
      <PageHeader title={isEditing ? 'Edit car' : 'Add car'} subtitle="Ensure all fields are accurate before saving." />
      {error && (
        <Alert tone="danger" title="Form error">
          {error}
        </Alert>
      )}
      <form className="card form" onSubmit={handleSubmit} noValidate>
        <FormField label="Brand" htmlFor="car-brand" error={errors.brand} required>
          <Input
            id="car-brand"
            value={form.brand}
            onChange={(event) => setForm((prev) => ({ ...prev, brand: event.target.value }))}
            hasError={Boolean(errors.brand)}
          />
        </FormField>
        <FormField label="Model" htmlFor="car-model" error={errors.model} required>
          <Input
            id="car-model"
            value={form.model}
            onChange={(event) => setForm((prev) => ({ ...prev, model: event.target.value }))}
            hasError={Boolean(errors.model)}
          />
        </FormField>
        <FormField label="Class" htmlFor="car-class" error={errors.car_class} required>
          <Input
            id="car-class"
            value={form.car_class}
            onChange={(event) => setForm((prev) => ({ ...prev, car_class: event.target.value }))}
            hasError={Boolean(errors.car_class)}
          />
        </FormField>
        <div className="form-row">
          <FormField label="Year" htmlFor="car-year" error={errors.year} required>
            <Input
              id="car-year"
              value={form.year}
              onChange={(event) => setForm((prev) => ({ ...prev, year: event.target.value }))}
              hasError={Boolean(errors.year)}
              inputMode="numeric"
            />
          </FormField>
          <FormField label="Daily price" htmlFor="car-price" error={errors.base_daily_price} required>
            <Input
              id="car-price"
              value={form.base_daily_price}
              onChange={(event) => setForm((prev) => ({ ...prev, base_daily_price: event.target.value }))}
              hasError={Boolean(errors.base_daily_price)}
              inputMode="decimal"
            />
          </FormField>
        </div>
        <FormField label="Status" htmlFor="car-status">
          <Select
            id="car-status"
            value={form.status}
            onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
          >
            <option value="AVAILABLE">Available</option>
            <option value="RENTED">Rented</option>
            <option value="MAINTENANCE">Maintenance</option>
          </Select>
        </FormField>
        <div className="form-actions">
          <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">{isEditing ? 'Save changes' : 'Create car'}</Button>
        </div>
      </form>
    </section>
  )
}
