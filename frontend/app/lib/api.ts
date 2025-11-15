import Constants from 'expo-constants'

const BASE = (process.env.EXPO_PUBLIC_API_URL as string) || ((Constants?.expoConfig?.extra as any)?.API_URL as string) || 'http://localhost:4000/v1'

function headers(token?: string) {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

export async function getProducts(params?: { page?: number; limit?: number; search?: string; sort?: string; category?: string }) {
  const qp: string[] = []
  if (params?.page) qp.push(`page=${encodeURIComponent(String(params.page))}`)
  if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`)
  if (params?.search) qp.push(`search=${encodeURIComponent(params.search)}`)
  if (params?.category) qp.push(`category=${encodeURIComponent(params.category)}`)
  if (params?.sort) qp.push(`sort=${encodeURIComponent(params.sort)}`)
  const url = `${BASE}/products${qp.length ? `?${qp.join('&')}` : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Error al obtener productos')
  return res.json()
}

export async function getProduct(id: number | string) {
  const res = await fetch(`${BASE}/products/${id}`)
  if (!res.ok) throw new Error('Producto no encontrado')
  return res.json()
}

export async function getCategories() {
  const res = await fetch(`${BASE}/categories`)
  if (!res.ok) throw new Error('Error al obtener categorías')
  return res.json()
}

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) throw new Error('Credenciales inválidas')
  return res.json()
}

export async function register(name: string, email: string, password: string) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ name, email, password })
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any)?.error?.message || 'Error de registro')
  return data
}

export async function changePassword(token: string, oldPassword: string, newPassword: string) {
  const res = await fetch(`${BASE}/auth/change`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ oldPassword, newPassword })
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any)?.error?.message || 'Error al cambiar contraseña')
  return data
}

export async function createOrder(token: string, payload: any) {
  const res = await fetch(`${BASE}/orders`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || 'Error al crear la orden')
  }
  return res.json()
}

export async function getOrders(token: string) {
  const res = await fetch(`${BASE}/orders/my`, { headers: headers(token) })
  if (!res.ok) throw new Error('Error al obtener pedidos')
  return res.json()
}