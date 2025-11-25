/**
 * API Client - Maneja todas las llamadas HTTP al backend
 * 
 * Este módulo centraliza la comunicación con el servidor backend,
 * incluyendo autenticación, productos, categorías y pedidos.
 */



// ============================================================================
// CONFIGURACIÓN DE LA URL BASE DEL API
// ============================================================================

// Importar la configuración unificada
import { API_URL } from '@/constants/config'

// URL base final que se usará para todas las peticiones
const BASE = API_URL

// Log simplificado
console.log('🌐 API Client usando URL:', BASE)

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Construye los headers HTTP para las peticiones
 * @param token - Token JWT opcional para autenticación
 * @returns Headers con Content-Type y Authorization si hay token
 */
function headers(token?: string): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

/**
 * Maneja errores de red y respuestas HTTP
 * @param error - Error capturado
 * @param defaultMessage - Mensaje por defecto si no hay mensaje específico
 * @returns Error formateado con mensaje descriptivo
 */
function handleError(error: any, defaultMessage: string): Error {
  console.error('❌ API Error:', error)
  console.error('❌ Error type:', typeof error)
  console.error('❌ Error keys:', Object.keys(error))
  console.error('❌ Error stack:', error.stack)
  
  // Error de red (sin conexión, timeout, etc)
  if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
    const apiUrl = BASE || 'URL no configurada'
    return new Error(`No se puede conectar al servidor.\n\nAPI URL: ${apiUrl}\n\nVerifica:\n1. El backend está corriendo\n2. La URL es correcta\n3. Tu celular está en la misma red WiFi`)
  }
  
  // Error con mensaje específico
  if (error.message) {
    return new Error(error.message)
  }
  
  // Error genérico
  return new Error(defaultMessage)
}

// ============================================================================
// ENDPOINTS DE PRODUCTOS
// ============================================================================

/**
 * Obtiene la lista de productos con filtros opcionales
 * @param params - Parámetros de búsqueda y paginación
 * @param params.page - Número de página (default: 1)
 * @param params.limit - Productos por página (default: 30)
 * @param params.search - Término de búsqueda
 * @param params.category - Slug de categoría para filtrar
 * @param params.sort - Orden de resultados (ej: 'created_desc', 'price_asc')
 * @returns Promise con array de productos o objeto paginado
 */
export async function getProducts(params?: { 
  page?: number
  limit?: number
  search?: string
  sort?: string
  category?: string 
}) {
  try {
    // Construir query parameters
    const qp: string[] = []
    if (params?.page) qp.push(`page=${encodeURIComponent(String(params.page))}`)
    if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`)
    if (params?.search) qp.push(`search=${encodeURIComponent(params.search)}`)
    if (params?.category) qp.push(`category=${encodeURIComponent(params.category)}`)
    if (params?.sort) qp.push(`sort=${encodeURIComponent(params.sort)}`)
    
    // Construir URL completa
    const url = `${BASE}/products${qp.length ? `?${qp.join('&')}` : ''}`
    console.log('📦 Fetching products:', url)
    
    // Realizar petición con timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos timeout
    
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`)
    }
    
    const data = await res.json()
    console.log('✅ Products loaded:', Array.isArray(data) ? data.length : data.items?.length || 0)
    return data
  } catch (error: any) {
    throw handleError(error, 'Error al obtener productos')
  }
}

/**
 * Obtiene los detalles de un producto específico
 * @param id - ID del producto
 * @returns Promise con los datos del producto
 */
export async function getProduct(id: number | string) {
  try {
    const url = `${BASE}/products/${id}`
    console.log('📦 Fetching product:', url)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      throw new Error(res.status === 404 ? 'Producto no encontrado' : `Error ${res.status}`)
    }
    
    const data = await res.json()
    console.log('✅ Product loaded:', data.name)
    return data
  } catch (error: any) {
    throw handleError(error, 'Error al obtener el producto')
  }
}

// ============================================================================
// ENDPOINTS DE CATEGORÍAS
// ============================================================================

/**
 * Obtiene todas las categorías disponibles
 * @returns Promise con array de categorías
 */
export async function getCategories() {
  try {
    const url = `${BASE}/categories`
    console.log('📂 Fetching categories:', url)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`)
    }
    
    const data = await res.json()
    console.log('✅ Categories loaded:', data.length)
    return data
  } catch (error: any) {
    throw handleError(error, 'Error al obtener categorías')
  }
}

// ============================================================================
// ENDPOINTS DE AUTENTICACIÓN
// ============================================================================

/**
 * Inicia sesión con email y contraseña
 * @param email - Email del usuario
 * @param password - Contraseña del usuario
 * @returns Promise con token JWT (normalizado como 'token')
 */
export async function login(email: string, password: string) {
  try {
    const url = `${BASE}/auth/login`
    console.log('🔐 Logging in:', email)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const res = await fetch(url, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email, password }),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      throw new Error(res.status === 401 ? 'Credenciales inválidas' : `Error ${res.status}`)
    }
    
    const data = await res.json()
    console.log('✅ Login successful')
    
    // El backend devuelve 'accessToken', normalizamos a 'token'
    return {
      token: data.accessToken || data.token
    }
  } catch (error: any) {
    throw handleError(error, 'Error al iniciar sesión')
  }
}

/**
 * Registra un nuevo usuario
 * @param name - Nombre completo del usuario
 * @param email - Email del usuario
 * @param password - Contraseña del usuario
 * @returns Promise con confirmación de registro
 */
export async function register(name: string, email: string, password: string) {
  try {
    const url = `${BASE}/auth/register`
    console.log('📝 Registering user:', email)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const res = await fetch(url, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ name, email, password }),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    const data = await res.json().catch(() => ({}))
    
    if (!res.ok) {
      throw new Error((data as any)?.error?.message || `Error ${res.status}`)
    }
    
    console.log('✅ Registration successful')
    return data
  } catch (error: any) {
    throw handleError(error, 'Error al registrar usuario')
  }
}

/**
 * Cambia la contraseña del usuario autenticado
 * @param token - Token JWT del usuario
 * @param oldPassword - Contraseña actual
 * @param newPassword - Nueva contraseña
 * @returns Promise con confirmación del cambio
 */
export async function changePassword(token: string, oldPassword: string, newPassword: string) {
  try {
    const url = `${BASE}/auth/change`
    console.log('🔑 Changing password')
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const res = await fetch(url, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ oldPassword, newPassword }),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    const data = await res.json().catch(() => ({}))
    
    if (!res.ok) {
      throw new Error((data as any)?.error?.message || `Error ${res.status}`)
    }
    
    console.log('✅ Password changed successfully')
    return data
  } catch (error: any) {
    throw handleError(error, 'Error al cambiar contraseña')
  }
}

/**
 * Solicita recuperación de contraseña - genera una contraseña temporal
 * @param email - Email del usuario que quiere recuperar su contraseña
 * @returns Promise con confirmación y posible contraseña temporal (en desarrollo)
 */
export async function forgotPassword(email: string) {
  try {
    const url = `${BASE}/auth/forgot`
    console.log('📧 Requesting password reset for:', email)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const res = await fetch(url, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email }),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    const data = await res.json().catch(() => ({}))
    
    if (!res.ok) {
      throw new Error((data as any)?.error?.message || `Error ${res.status}`)
    }
    
    console.log('✅ Password reset processed')
    return data
  } catch (error: any) {
    throw handleError(error, 'Error al solicitar recuperación de contraseña')
  }
}

// ============================================================================
// ENDPOINTS DE PEDIDOS
// ============================================================================

/**
 * Crea un nuevo pedido
 * @param token - Token JWT del usuario
 * @param payload - Datos del pedido (items, shipping, payment)
 * @returns Promise con los datos del pedido creado
 */
export async function createOrder(token: string, payload: any) {
  try {
    const url = `${BASE}/orders`
    console.log('🛒 Creating order:', payload.items.length, 'items')
    console.log('🛒 Payload:', JSON.stringify(payload, null, 2))
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 segundos para crear orden
    
    const res = await fetch(url, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(payload),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      const errorMsg = (data as any)?.error?.message || `Error ${res.status}`
      console.error('❌ Order creation failed:', errorMsg)
      console.error('❌ Response:', data)
      throw new Error(errorMsg)
    }
    
    const data = await res.json()
    console.log('✅ Order created:', data.id)
    return data
  } catch (error: any) {
    throw handleError(error, 'Error al crear el pedido')
  }
}

/**
 * Obtiene los pedidos del usuario autenticado
 * @param token - Token JWT del usuario
 * @returns Promise con array de pedidos
 */
export async function getOrders(token: string) {
  try {
    const url = `${BASE}/orders/my`
    console.log('📋 Fetching user orders')
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const res = await fetch(url, { 
      headers: headers(token),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`)
    }
    
    const data = await res.json()
    console.log('✅ Orders loaded:', data.length)
    return data
  } catch (error: any) {
    throw handleError(error, 'Error al obtener pedidos')
  }
}

// ============================================================================
// ENDPOINTS DE ADMINISTRACIÓN
// ============================================================================

/**
 * Obtiene todas las órdenes del sistema (solo ADMIN)
 * @param token - Token JWT del administrador
 * @param params - Parámetros de paginación
 * @returns Promise con lista paginada de órdenes
 */
export async function getAllOrders(token: string, params?: { page?: number; limit?: number }) {
  try {
    const qp: string[] = []
    if (params?.page) qp.push(`page=${params.page}`)
    if (params?.limit) qp.push(`limit=${params.limit}`)
    
    const url = `${BASE}/orders${qp.length ? `?${qp.join('&')}` : ''}`
    console.log('📋 Fetching all orders (admin)')
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const res = await fetch(url, {
      headers: headers(token),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`)
    }
    
    const data = await res.json()
    console.log('✅ All orders loaded:', data.items?.length || 0)
    return data
  } catch (error: any) {
    throw handleError(error, 'Error al obtener todas las órdenes')
  }
}

/**
 * Actualiza el estado de una orden (solo ADMIN)
 * @param token - Token JWT del administrador
 * @param orderId - ID de la orden
 * @param status - Nuevo estado (PAID, SHIPPED, DELIVERED, CANCELLED)
 * @returns Promise con la orden actualizada
 */
export async function updateOrderStatus(token: string, orderId: number, status: string) {
  try {
    const url = `${BASE}/orders/${orderId}/status`
    console.log('📋 Updating order status:', orderId, status)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const res = await fetch(url, {
      method: 'PUT',
      headers: headers(token),
      body: JSON.stringify({ status }),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`)
    }
    
    const data = await res.json()
    console.log('✅ Order status updated')
    return data
  } catch (error: any) {
    throw handleError(error, 'Error al actualizar estado de orden')
  }
}

/**
 * Crea un nuevo producto (solo ADMIN)
 * @param token - Token JWT del administrador
 * @param product - Datos del producto
 * @returns Promise con el producto creado
 */
export async function createProduct(token: string, product: any) {
  try {
    const url = `${BASE}/products`
    console.log('📦 Creating product:', product.name)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)
    
    const res = await fetch(url, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(product),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error((data as any)?.error?.message || `Error ${res.status}`)
    }
    
    const data = await res.json()
    console.log('✅ Product created:', data.id)
    return data
  } catch (error: any) {
    throw handleError(error, 'Error al crear producto')
  }
}

/**
 * Actualiza un producto existente (solo ADMIN)
 * @param token - Token JWT del administrador
 * @param productId - ID del producto
 * @param product - Datos actualizados del producto
 * @returns Promise con el producto actualizado
 */
export async function updateProduct(token: string, productId: number, product: any) {
  try {
    const url = `${BASE}/products/${productId}`
    console.log('📦 Updating product:', productId)
    // Prevent sending empty update payload which causes backend "The query is empty" errors
    if (!product || (Object.keys(product).length === 0)) {
      throw new Error('No hay campos para actualizar')
    }
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)
    
    const res = await fetch(url, {
      method: 'PUT',
      headers: headers(token),
      body: JSON.stringify(product),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error((data as any)?.error?.message || `Error ${res.status}`)
    }
    
    const data = await res.json()
    console.log('✅ Product updated')
    return data
  } catch (error: any) {
    throw handleError(error, 'Error al actualizar producto')
  }
}

/**
 * Elimina un producto (solo ADMIN)
 * @param token - Token JWT del administrador
 * @param productId - ID del producto
 * @returns Promise vacía
 */
export async function deleteProduct(token: string, productId: number) {
  try {
    const url = `${BASE}/products/${productId}`
    console.log('📦 Deleting product:', productId)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const res = await fetch(url, {
      method: 'DELETE',
      headers: headers(token),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`)
    }
    
    console.log('✅ Product deleted')
  } catch (error: any) {
    throw handleError(error, 'Error al eliminar producto')
  }
}

/**
 * Crea una nueva categoría (solo ADMIN)
 * @param token - Token JWT del administrador
 * @param category - Datos de la categoría
 * @returns Promise con la categoría creada
 */
export async function createCategory(token: string, category: { name: string }) {
  try {
    const url = `${BASE}/categories`
    console.log('📂 Creating category:', category.name)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const res = await fetch(url, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(category),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error((data as any)?.error?.message || `Error ${res.status}`)
    }
    
    const data = await res.json()
    console.log('✅ Category created:', data.id)
    return data
  } catch (error: any) {
    throw handleError(error, 'Error al crear categoría')
  }
}

/**
 * Actualiza una categoría (solo ADMIN)
 * @param token - Token JWT del administrador
 * @param categoryId - ID de la categoría
 * @param category - Datos actualizados
 * @returns Promise con la categoría actualizada
 */
export async function updateCategory(token: string, categoryId: number, category: { name: string }) {
  try {
    const url = `${BASE}/categories/${categoryId}`
    console.log('📂 Updating category:', categoryId)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const res = await fetch(url, {
      method: 'PUT',
      headers: headers(token),
      body: JSON.stringify(category),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error((data as any)?.error?.message || `Error ${res.status}`)
    }
    
    const data = await res.json()
    console.log('✅ Category updated')
    return data
  } catch (error: any) {
    throw handleError(error, 'Error al actualizar categoría')
  }
}

/**
 * Elimina una categoría (solo ADMIN)
 * @param token - Token JWT del administrador
 * @param categoryId - ID de la categoría
 * @returns Promise vacía
 */
export async function deleteCategory(token: string, categoryId: number) {
  try {
    const url = `${BASE}/categories/${categoryId}`
    console.log('📂 Deleting category:', categoryId)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const res = await fetch(url, {
      method: 'DELETE',
      headers: headers(token),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`)
    }
    
    console.log('✅ Category deleted')
  } catch (error: any) {
    throw handleError(error, 'Error al eliminar categoría')
  }
}

// ============================================================================
// ENDPOINTS DE GESTIÓN DE USUARIOS (ADMIN)
// ============================================================================

/**
 * Obtiene todos los usuarios del sistema (solo ADMIN)
 * @param token - Token JWT del administrador
 * @param params - Parámetros de búsqueda y paginación
 * @returns Promise con lista de usuarios
 */
export async function getUsers(token: string, params?: { page?: number; limit?: number; search?: string }) {
  try {
    const qp: string[] = []
    if (params?.page) qp.push(`page=${params.page}`)
    if (params?.limit) qp.push(`limit=${params.limit}`)
    if (params?.search) qp.push(`search=${encodeURIComponent(params.search)}`)
    
    const url = `${BASE}/users${qp.length ? `?${qp.join('&')}` : ''}`
    console.log('👥 Fetching users (admin)')
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const res = await fetch(url, {
      headers: headers(token),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`)
    }
    
    const data = await res.json()
    console.log('✅ Users loaded:', data.items?.length || 0)
    return data
  } catch (error: any) {
    throw handleError(error, 'Error al obtener usuarios')
  }
}

/**
 * Crea un nuevo usuario (solo ADMIN)
 * @param token - Token JWT del administrador
 * @param user - Datos del usuario
 * @returns Promise con el usuario creado
 */
export async function createUser(token: string, user: { name: string; email: string; password?: string; role: string }) {
  try {
    const url = `${BASE}/users`
    console.log('👤 Creating user:', user.email)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const res = await fetch(url, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(user),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error((data as any)?.error?.message || `Error ${res.status}`)
    }
    
    const data = await res.json()
    console.log('✅ User created:', data.id)
    return data
  } catch (error: any) {
    throw handleError(error, 'Error al crear usuario')
  }
}

/**
 * Actualiza un usuario (solo ADMIN)
 * @param token - Token JWT del administrador
 * @param userId - ID del usuario
 * @param user - Datos actualizados
 * @returns Promise con el usuario actualizado
 */
export async function updateUser(token: string, userId: number, user: { name?: string; email?: string; password?: string; role?: string; resetPassword?: boolean }) {
  try {
    const url = `${BASE}/users/${userId}`
    console.log('👤 Updating user:', userId)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const res = await fetch(url, {
      method: 'PUT',
      headers: headers(token),
      body: JSON.stringify(user),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error((data as any)?.error?.message || `Error ${res.status}`)
    }
    
    const data = await res.json()
    console.log('✅ User updated')
    return data
  } catch (error: any) {
    throw handleError(error, 'Error al actualizar usuario')
  }
}

/**
 * Elimina un usuario (solo ADMIN)
 * @param token - Token JWT del administrador
 * @param userId - ID del usuario
 * @returns Promise vacía
 */
export async function deleteUser(token: string, userId: number) {
  try {
    const url = `${BASE}/users/${userId}`
    console.log('👤 Deleting user:', userId)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const res = await fetch(url, {
      method: 'DELETE',
      headers: headers(token),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`)
    }
    
    console.log('✅ User deleted')
  } catch (error: any) {
    throw handleError(error, 'Error al eliminar usuario')
  }
}