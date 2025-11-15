import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, FlatList, Image } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createOrder } from '@/app/lib/api'
import { useCart } from '@/app/context/CartContext'
import { getToken } from '@/app/lib/auth'

export default function CheckoutScreen() {
  const router = useRouter()
  const { items, total, clear } = useCart()
  const [cardNumber, setCardNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      const p = await AsyncStorage.getItem('settings.payment')
      if (p) {
        try { const parsed = JSON.parse(p); setCardNumber(parsed?.last4 ? '' : '') } catch {}
      }
    })()
  }, [])

  async function handlePay() {
    try {
      setLoading(true); setError('')
      const token = await getToken()
      if (!token) { router.push('/login'); return }
      let shipping: any = {}
      let payment: any = {}
      try {
        const s = await AsyncStorage.getItem('settings.shipping')
        if (s) shipping = JSON.parse(s)
        const p = await AsyncStorage.getItem('settings.payment')
        if (p) payment = JSON.parse(p)
      } catch {}
      if (!shipping.fullName) {
        const nombres = ['Juan Pérez','María López','Carlos García','Ana Torres']
        const ciudades = ['CDMX','Guadalajara','Monterrey','Puebla']
        shipping = {
          fullName: nombres[Math.floor(Math.random()*nombres.length)],
          phone: `55${Math.floor(10000000 + Math.random()*89999999)}`,
          address1: `Calle ${Math.floor(Math.random()*200)} #${Math.floor(Math.random()*999)}`,
          address2: '',
          city: ciudades[Math.floor(Math.random()*ciudades.length)],
          state: 'NA',
          zip: String(10000 + Math.floor(Math.random()*89999)),
          country: 'México'
        }
      }
      const digits = (cardNumber || '').replace(/\D/g, '')
      payment = { ...payment, cardNumber: digits }
      const payload = {
        items: items.map(i => ({ productId: i.id, quantity: i.qty })),
        shipping,
        payment
      }
      const order = await createOrder(token, payload)
      clear()
      router.replace(`/orders`)
    } catch (e: any) {
      setError(e.message || 'Error al procesar el pago')
    } finally { setLoading(false) }
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '600' }}>Checkout</Text>
      {items.length === 0 ? (
        <Text style={{ marginTop: 12 }}>No hay productos en el carrito.</Text>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(i) => String(i.id)}
            renderItem={({ item }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'white', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#eee', marginTop: 12 }}>
                {item.img ? <Image source={{ uri: item.img }} style={{ width: 56, height: 56, borderRadius: 8 }} /> : null}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600' }}>{item.name}</Text>
                  <Text style={{ color: '#666' }}>x{item.qty}</Text>
                </View>
                <Text style={{ fontWeight: '700' }}>${(item.price * item.qty).toFixed(2)}</Text>
              </View>
            )}
          />
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#eee', marginTop: 16 }}>
            <Text style={{ fontSize: 16 }}>Total</Text>
            <Text style={{ marginTop: 4, fontSize: 28, fontWeight: '700' }}>${total.toFixed(2)}</Text>
            <TextInput placeholder="4111 1111 1111 1111" value={cardNumber} onChangeText={setCardNumber} style={{ marginTop: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40 }} />
            {!!error && <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text>}
            <Pressable onPress={handlePay} disabled={loading} style={{ marginTop: 12, backgroundColor: '#111', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '600' }}>{loading ? 'Procesando…' : 'Pagar'}</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  )
}