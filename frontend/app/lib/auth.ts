import AsyncStorage from '@react-native-async-storage/async-storage'
import { decode as b64decode } from 'base-64'

export async function getToken() {
  return (await AsyncStorage.getItem('token')) || null
}

export async function setToken(token: string) {
  await AsyncStorage.setItem('token', token)
}

export async function clearToken() {
  await AsyncStorage.removeItem('token')
}

export function decodeJwt(token: string) {
  try {
    const [, payload] = token.split('.')
    const json = JSON.parse(b64decode(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return json
  } catch {
    return null
  }
}

export async function getUser() {
  const token = await getToken()
  if (!token) return null as any
  const payload = decodeJwt(token)
  if (!payload) return null as any
  const { id, role, email, exp } = payload
  return { id, role, email, exp }
}