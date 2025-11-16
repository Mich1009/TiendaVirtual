import { useEffect, useState } from 'react'
import { View, Text, FlatList } from 'react-native'
import { getOrders } from '@/lib/api'
import { getToken } from '@/lib/auth'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'

type OrderItem = { order_id: number; product_name: string; quantity: number; unit_price: number }
type Order = { id: number; total: number; status: string; items: OrderItem[] }

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState('')
  const scheme = useColorScheme()
  const C = Colors[scheme ?? 'light']

  useEffect(() => {
    ;(async () => {
      try {
        const token = await getToken()
        if (!token) { setError('Inicia sesión para ver tus pedidos'); return }
        const list = await getOrders(token)
        setOrders(Array.isArray(list) ? list as any : [])
        setError('')
      } catch (e: any) {
        setError(e.message || 'Error al obtener pedidos')
      }
    })()
  }, [])

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: C.background }}>
      <Text style={{ fontSize: 22, fontWeight: '600', color: C.text }}>Mis pedidos</Text>
      {!!error && <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text>}
      <FlatList
        data={orders}
        keyExtractor={(o) => String(o.id)}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: C.background, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#eee', marginTop: 12 }}>
            <Text style={{ fontWeight: '600', color: C.text }}>Pedido #{item.id}</Text>
            <Text style={{ color: C.icon }}>Estado: {item.status}</Text>
            <Text style={{ fontWeight: '700', marginTop: 4, color: C.text }}>Total: ${Number(item.total).toFixed(2)}</Text>
            <FlatList
              data={item.items || []}
              keyExtractor={(i, idx) => String(item.id) + '-' + idx}
              renderItem={({ item: it }) => (
                <View style={{ marginTop: 6 }}>
                  <Text style={{ color: C.text }}>{it.product_name} x{it.quantity} · ${Number(it.unit_price).toFixed(2)}</Text>
                </View>
              )}
            />
          </View>
        )}
      />
    </View>
  )
}