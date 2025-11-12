const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/v1'

function headers(token) {
  const h = { 'Content-Type': 'application/json' }
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

export async function getProducts() {
  const res = await fetch(`${BASE}/products`)
  if (!res.ok) throw new Error('Error al obtener productos')
  return res.json()
}

export async function getProduct(id) {
  const res = await fetch(`${BASE}/products/${id}`)
  if (!res.ok) throw new Error('Producto no encontrado')
  return res.json()
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) throw new Error('Credenciales inválidas')
  return res.json()
}

export async function register(name, email, password) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ name, email, password })
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error?.message || 'Error de registro')
  return data
}

export async function forgotPassword(email) {
  const res = await fetch(`${BASE}/auth/forgot`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email })
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error?.message || 'Error al recuperar contraseña')
  return data
}

export async function changePassword(token, oldPassword, newPassword) {
  const res = await fetch(`${BASE}/auth/change`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ oldPassword, newPassword })
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error?.message || 'Error al cambiar contraseña')
  return data
}

export async function createOrder(token, payload) {
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

export async function getOrders(token) {
  const res = await fetch(`${BASE}/orders/my`, {
    headers: headers(token)
  })
  if (!res.ok) throw new Error('Error al obtener pedidos')
  return res.json()
}

// Admin APIs
export async function getOrdersAdmin(token, { page = 1, limit = 20 } = {}) {
  const url = new URL(`${BASE}/orders`)
  url.searchParams.set('page', String(page))
  url.searchParams.set('limit', String(limit))
  const res = await fetch(url.toString(), { headers: headers(token) })
  if (!res.ok) throw new Error('Error al obtener órdenes (admin)')
  return res.json()
}

export async function setOrderStatus(token, id, status) {
  const res = await fetch(`${BASE}/orders/${id}/status`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify({ status })
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || 'Error al actualizar estado de la orden')
  }
  return res.json()
}

// Admin · Categorías
export async function getCategories() {
  const res = await fetch(`${BASE}/categories`)
  if (!res.ok) throw new Error('Error al obtener categorías')
  return res.json()
}

export async function createCategory(token, name) {
  const res = await fetch(`${BASE}/categories`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ name })
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || 'Error al crear categoría')
  }
  return res.json()
}

export async function updateCategory(token, id, name) {
  const res = await fetch(`${BASE}/categories/${id}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify({ name })
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || 'Error al actualizar categoría')
  }
  return res.json()
}

export async function deleteCategory(token, id) {
  const res = await fetch(`${BASE}/categories/${id}`, {
    method: 'DELETE',
    headers: headers(token)
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || 'Error al eliminar categoría')
  }
}

// Admin · Productos
export async function getProductsAdmin({ page = 1, limit = 12, search = '', sort = 'created_desc', category = '' } = {}) {
  const url = new URL(`${BASE}/products`)
  url.searchParams.set('page', String(page))
  url.searchParams.set('limit', String(limit))
  if (search) url.searchParams.set('search', search)
  if (category) url.searchParams.set('category', category)
  if (sort) url.searchParams.set('sort', sort)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Error al obtener productos')
  return res.json()
}

export async function createProduct(token, payload) {
  const res = await fetch(`${BASE}/products`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || 'Error al crear producto')
  }
  return res.json()
}

export async function updateProduct(token, id, payload) {
  const res = await fetch(`${BASE}/products/${id}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || 'Error al actualizar producto')
  }
  return res.json()
}

export async function deleteProduct(token, id) {
  const res = await fetch(`${BASE}/products/${id}`, {
    method: 'DELETE',
    headers: headers(token)
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || 'Error al eliminar producto')
  }
}

export async function addProductImageUrl(token, id, { url, alt }) {
  const res = await fetch(`${BASE}/products/${id}/images`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ url, alt })
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || 'Error al agregar imagen')
  }
  return res.json()
}

export async function deleteProductImage(token, id, imageId) {
  const res = await fetch(`${BASE}/products/${id}/images/${imageId}`, {
    method: 'DELETE',
    headers: headers(token)
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || 'Error al eliminar imagen')
  }
}

// Admin · Usuarios
export async function getUsersAdmin(token, { page = 1, limit = 20, search = '' } = {}) {
  const url = new URL(`${BASE}/users`)
  url.searchParams.set('page', String(page))
  url.searchParams.set('limit', String(limit))
  if (search) url.searchParams.set('search', search)
  const res = await fetch(url.toString(), { headers: headers(token) })
  if (!res.ok) throw new Error('Error al obtener usuarios')
  return res.json()
}

export async function createUserAdmin(token, { name, email, role, password }) {
  const res = await fetch(`${BASE}/users`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ name, email, role, password })
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error?.message || 'Error al crear usuario')
  return data
}

export async function updateUserAdmin(token, id, { name, email, role, resetPassword, password }) {
  const res = await fetch(`${BASE}/users/${id}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify({ name, email, role, resetPassword, password })
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error?.message || 'Error al actualizar usuario')
  return data
}

export async function deleteUserAdmin(token, id) {
  const res = await fetch(`${BASE}/users/${id}`, {
    method: 'DELETE',
    headers: headers(token)
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || 'Error al eliminar usuario')
  }
}