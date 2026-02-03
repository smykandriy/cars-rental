const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER' | string

export type User = {
  id: number
  email: string
  full_name: string
  role: UserRole
}

export type CarStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | string

export type Car = {
  id: number
  brand: string
  model: string
  car_class: string
  year: number
  base_daily_price: string
  status: CarStatus
}

export type Rental = {
  id: number
  customer: number
  customer_email?: string
  car: number
  car_display?: string
  issue_date: string
  expected_return_date: string
  actual_return_date?: string | null
  status: string
}

export type Customer = {
  id: number
  email: string
  full_name: string
  role: UserRole
  address?: string
  phone?: string
}

export type OccupancyRow = {
  car_id: number
  car: string
  status: string
  expected_return_date?: string | null
}

export type FinancialRow = {
  car_id: number
  revenue: string
  penalties_total: string
  net_amount: string
}

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.status = status
    this.data = data
  }
}

export const tokenStorage = {
  get: () => localStorage.getItem('token'),
  set: (token: string) => localStorage.setItem('token', token),
  clear: () => localStorage.removeItem('token')
}

const buildQuery = (params: Record<string, string | number | undefined | null>) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  if (!response.ok) {
    throw new ApiError(`Request failed: ${response.status}`, response.status, data)
  }
  return data as T
}

export const api = {
  login: (email: string, password: string) =>
    request<{ access: string }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  register: (payload: { email: string; full_name: string; password: string; address: string; phone: string }) =>
    request('/auth/register/', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request<User>('/auth/me/'),
  cars: () => request<Car[]>('/cars/'),
  car: (id: number) => request<Car>(`/cars/${id}/`),
  createCar: (payload: Omit<Car, 'id'>) => request<Car>('/cars/', { method: 'POST', body: JSON.stringify(payload) }),
  updateCar: (id: number, payload: Partial<Omit<Car, 'id'>>) =>
    request<Car>(`/cars/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteCar: (id: number) => request<void>(`/cars/${id}/`, { method: 'DELETE' }),
  rentals: (params?: { status?: string; customer?: string; car?: string; date_from?: string; date_to?: string }) =>
    request<Rental[]>(`/rentals/${params ? buildQuery(params) : ''}`),
  rental: (id: number) => request<Rental>(`/rentals/${id}/`),
  createRental: (payload: {
    customer: number
    car: number
    issue_date: string
    expected_return_date: string
    deposit_amount: string
  }) => request<Rental>('/rentals/', { method: 'POST', body: JSON.stringify(payload) }),
  updateRental: (id: number, payload: Partial<Rental>) =>
    request<Rental>(`/rentals/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  returnRental: (id: number, payload: { actual_return_date?: string; bad_condition?: boolean }) =>
    request<{ rental: Rental; invoice_total: string }>(`/rentals/${id}/return/`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  customers: () => request<Customer[]>('/customers/'),
  customer: (id: number) => request<Customer>(`/customers/${id}/`),
  updateCustomer: (id: number, payload: Partial<Customer>) =>
    request<Customer>(`/customers/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  occupancyReport: (date: string) => request<OccupancyRow[]>(`/reports/occupancy/?date=${date}`),
  financialReport: (from: string, to: string) => request<FinancialRow[]>(`/reports/financial/?date_from=${from}&date_to=${to}`)
}
