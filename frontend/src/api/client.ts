const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export type User = {
  id: number
  email: string
  full_name: string
  role: string
}

export const tokenStorage = {
  get: () => localStorage.getItem('token'),
  set: (token: string) => localStorage.setItem('token', token),
  clear: () => localStorage.removeItem('token')
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
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return response.json()
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
  cars: () => request('/cars/'),
  createCar: (payload: {
    brand: string
    model: string
    car_class: string
    year: number
    base_daily_price: string
    status: string
  }) => request('/cars/', { method: 'POST', body: JSON.stringify(payload) }),
  rentals: () => request('/rentals/'),
  createRental: (payload: {
    customer: number
    car: number
    issue_date: string
    expected_return_date: string
    deposit_amount: string
  }) => request('/rentals/', { method: 'POST', body: JSON.stringify(payload) }),
  returnRental: (id: number, payload: { actual_return_date?: string; bad_condition?: boolean }) =>
    request(`/rentals/${id}/return/`, { method: 'POST', body: JSON.stringify(payload) }),
  occupancyReport: (date: string) => request(`/reports/occupancy/?date=${date}`),
  financialReport: (from: string, to: string) => request(`/reports/financial/?date_from=${from}&date_to=${to}`)
}
