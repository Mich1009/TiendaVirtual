import { useEffect, useState } from 'react'
import { SafeAreaView, View, Text, Image, ActivityIndicator, FlatList } from 'react-native'
import { getMyOrders } from '../lib/api'
import { getToken } from '../lib/auth'

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setError('')
        const token = await getToken()
        const data = await getMyOrders(token)
        const list = Array.isArray(data) ? data : data.items || []
        setOrders(list)
      } catch (e) { setError(e.message) }
      finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <ActivityIndicator style={{ marginTop: 24 }} />
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-4">
        <Text className="text-2xl font-bold">Mis pedidos</Text>
        {!!error && <Text className="text-red-500 mt-2">{error}</Text>}
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View className="px-4 py-3 border-b border-neutral-100 gap-2">
            <Text className="font-semibold">Pedido #{item.id} · {item.status}</Text>
            <FlatList
              data={item.items || []}
              horizontal
              keyExtractor={(_, idx) => String(idx)}
              ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
              renderItem={({ item: it }) => {
                const img = it.product_image_url
                return (
                  <View className="items-center">
                    {img ? (
                      <Image source={{ uri: img }} style={{ width: 64, height: 64, borderRadius: 8 }} />
                    ) : (
                      <View className="w-16 h-16 bg-neutral-100 items-center justify-center rounded"><Text className="text-neutral-500">No img</Text></View>
                    )}
                    <Text className="text-xs mt-1" numberOfLines={1}>{it.product_name}</Text>
                  </View>
                )
              }}
            />
          </View>
        )}
      />
    </SafeAreaView>
  )
}