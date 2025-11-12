import { useEffect, useState } from 'react'
import { SafeAreaView, View, Text, Image, Button, FlatList } from 'react-native'
import { getCart, setCart } from '../lib/cart'

export default function Cart({ onCheckout }) {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    (async () => {
      const c = await getCart()
      setItems(c)
    })()
  }, [])

  useEffect(() => {
    const t = items.reduce((s, i) => s + (i.qty * (i.product?.price || 0)), 0)
    setTotal(t)
  }, [items])

  const updateQty = async (index, delta) => {
    const next = [...items]
    next[index].qty = Math.max(1, next[index].qty + delta)
    setItems(next)
    await setCart(next)
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-4">
        <Text className="text-2xl font-bold">Carrito</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(_, idx) => String(idx)}
        renderItem={({ item, index }) => (
          <View className="flex-row items-center gap-3 px-4 py-3 border-b border-neutral-100">
            {item.product?.image ? (
              <Image source={{ uri: item.product.image }} style={{ width: 56, height: 56, borderRadius: 8 }} />
            ) : (
              <View className="w-14 h-14 bg-neutral-100 items-center justify-center rounded"><Text className="text-neutral-500">No img</Text></View>
            )}
            <View className="flex-1">
              <Text className="font-semibold" numberOfLines={1}>{item.product?.name}</Text>
              <Text className="text-neutral-600">${item.product?.price} · Cant: {item.qty}</Text>
            </View>
            <View className="flex-row gap-2">
              <Button title="-" onPress={() => updateQty(index, -1)} />
              <Button title="+" onPress={() => updateQty(index, +1)} />
            </View>
          </View>
        )}
        ListFooterComponent={() => (
          <View className="px-4 py-4">
            <Text className="text-lg font-bold">Total: ${total.toFixed(2)}</Text>
            <View className="mt-3">
              <Button title="Continuar al pago" onPress={onCheckout} />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  )
}