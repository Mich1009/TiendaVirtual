import AsyncStorage from '@react-native-async-storage/async-storage'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY)
}

export async function setToken(token) {
  if (!token) return clearToken()
  await AsyncStorage.setItem(TOKEN_KEY, token)
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY)
}

export async function getUser() {
  const raw = await AsyncStorage.getItem(USER_KEY)
  try { return raw ? JSON.parse(raw) : null } catch { return null }
}

export async function setUser(user) {
  if (!user) return clearUser()
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user))
}

export async function clearUser() {
  await AsyncStorage.removeItem(USER_KEY)
}