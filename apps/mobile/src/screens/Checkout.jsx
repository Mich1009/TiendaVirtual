import { useEffect, useState } from 'react'
import { SafeAreaView, View, Text, Image, TextInput, ActivityIndicator, FlatList } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Btn from '../ui/Button'
import { getCart, setCart } from '../lib/cart'
import { getToken } from '../lib/auth'
import { createOrder } from '../lib/api'

export default function Checkout({ navigation }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cardNumber, setCardNumber] = useState('')

  useEffect(() => {
    (async () => {
      const c = await getCart()
      setItems(c.map(i => ({ id: i.product?.id, name: i.product?.name, img: i.product?.image, price: i.product?.price, qty: i.qty })))
    })()
  }, [])

  const total = items.reduce((sum, i) => sum + (Number(i.price) * Number(i.qty)), 0)

  const handlePay = async () => {
    try {
      setLoading(true); setError('')
      const token = await getToken()
      if (!token) { setError('Debes iniciar sesión para pagar'); return }
      // cargar configuración guardada y generar datos si falta
      let shipping = {}
      let payment = {}
      try {
        const s = JSON.parse((await AsyncStorage.getItem('settings.shipping')) || 'null')
        if (s) shipping = s
        const p = JSON.parse((await AsyncStorage.getItem('settings.payment')) || 'null')
        if (p) payment = p
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
      await setCart([])
      navigation.navigate('OrderConfirmation', { order })
    } catch (e) {
      setError(e.message || 'Error al procesar el pago')
    } finally { setLoading(false) }
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 24 }} />
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-4">
        <Text className="text-2xl font-bold">Checkout</Text>
      </View>
      {items.length === 0 ? (
        <View className="px-4"><Text>No hay productos en el carrito.</Text></View>
      ) : (
        <View className="flex-1">
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <View className="flex-row items-center gap-3 px-4 py-3 border-b border-neutral-100">
                {item.img ? (
                  <Image source={{ uri: item.img }} style={{ width: 64, height: 64, borderRadius: 8 }} />
                ) : (
                  <View className="w-16 h-16 bg-neutral-100 items-center justify-center rounded"><Text className="text-neutral-500">No img</Text></View>
                )}
                <View className="flex-1">
                  <Text className="font-medium" numberOfLines={1}>{item.name}</Text>
                  <Text className="text-neutral-600">x{item.qty}</Text>
                </View>
                <Text className="font-semibold">${(Number(item.price) * Number(item.qty)).toFixed(2)}</Text>
              </View>
            )}
            ListFooterComponent={() => (
              <View className="px-4 py-6">
                <Text className="text-lg">Total</Text>
                <Text className="text-3xl font-extrabold mt-2">${total.toFixed(2)}</Text>
                <View className="mt-4">
                  <Text className="text-sm text-neutral-600">Número de tarjeta (simulación)</Text>
                  <TextInput
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    placeholder="4111 1111 1111 1111"
                    className="rounded-md border border-neutral-300 px-3 py-2 mt-1"
                  />
                  <Text className="text-xs text-neutral-500 mt-1">No validamos ni guardamos el número completo; se utiliza para derivar marca y últimos 4.</Text>
                </View>
                {!!error && <Text className="text-red-600 mt-4">{error}</Text>}
                <View className="mt-6">
                  <Btn title={loading ? 'Procesando…' : 'Pagar'} onPress={handlePay} disabled={loading} loading={loading} />
                </View>
              </View>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  )
}