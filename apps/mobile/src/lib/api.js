const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/v1'

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || 'Error de login')
  return data
}

export async function getOrdersAdmin(token, { page = 1, limit = 20 } = {}) {
  const res = await fetch(`${API_URL}/orders?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error('Error al obtener órdenes (admin)')
  return data
}

export async function setOrderStatus(token, id, status) {
  const res = await fetch(`${API_URL}/orders/${id}/status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || 'Error al actualizar estado')
  return data
}

export async function getProducts({ page = 1, limit = 12, search = '', sort = 'created_desc', category = '' } = {}) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(limit))
  if (search) params.set('search', search)
  if (category) params.set('category', category)
  if (sort) params.set('sort', sort)
  const res = await fetch(`${API_URL}/products?${params.toString()}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || 'Error al cargar productos')
  return data
}

export async function getProduct(id) {
  const res = await fetch(`${API_URL}/products/${id}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || 'Producto no encontrado')
  return data
}

export async function getMyOrders(token) {
  const res = await fetch(`${API_URL}/orders/my`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || 'Error al cargar mis pedidos')
  return data
}