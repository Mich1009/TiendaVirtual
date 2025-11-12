import AsyncStorage from '@react-native-async-storage/async-storage'

const CART_KEY = 'cart'

export async function getCart() {
  const raw = await AsyncStorage.getItem(CART_KEY)
  try { return raw ? JSON.parse(raw) : [] } catch { return [] }
}

export async function setCart(items) {
  await AsyncStorage.setItem(CART_KEY, JSON.stringify(items || []))
}

export async function addToCart(product, qty = 1) {
  const current = await getCart()
  const idx = current.findIndex(i => i.product?.id === product.id)
  if (idx >= 0) current[idx].qty += qty
  else current.push({ product, qty })
  await setCart(current)
}

export async function clearCart() {
  await AsyncStorage.removeItem(CART_KEY)
}