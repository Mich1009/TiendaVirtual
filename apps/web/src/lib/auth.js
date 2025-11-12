export function getToken() {
  return localStorage.getItem('token') || null
}

export function clearToken() {
  localStorage.removeItem('token')
}

export function decodeJwt(token) {
  try {
    const [, payload] = token.split('.')
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return json
  } catch {
    return null
  }
}

export function getUser() {
  const token = getToken()
  if (!token) return null
  const payload = decodeJwt(token)
  if (!payload) return null
  const { id, role, email, exp } = payload
  return { id, role, email, exp }
}

export function emitAuthChanged() {
  window.dispatchEvent(new Event('auth-changed'))
}