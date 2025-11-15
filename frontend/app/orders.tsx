import { useEffect, useState } from 'react'
import { View, Text, FlatList } from 'react-native'
import { getOrders } from '@/app/lib/api'
import { getToken } from '@/app/lib/auth'

type OrderItem = { order_id: number; product_name: string; quantity: number; unit_price: number }
type Order = { id: number; total: number; status: string; items: OrderItem[] }

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState('')

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
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '600' }}>Mis pedidos</Text>
      {!!error && <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text>}
      <FlatList
        data={orders}
        keyExtractor={(o) => String(o.id)}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#eee', marginTop: 12 }}>
            <Text style={{ fontWeight: '600' }}>Pedido #{item.id}</Text>
            <Text style={{ color: '#666' }}>Estado: {item.status}</Text>
            <Text style={{ fontWeight: '700', marginTop: 4 }}>Total: ${Number(item.total).toFixed(2)}</Text>
            <FlatList
              data={item.items || []}
              keyExtractor={(i, idx) => String(item.id) + '-' + idx}
              renderItem={({ item: it }) => (
                <View style={{ marginTop: 6 }}>
                  <Text>{it.product_name} x{it.quantity} · ${Number(it.unit_price).toFixed(2)}</Text>
                </View>
              )}
            />
          </View>
        )}
      />
    </View>
  )
}