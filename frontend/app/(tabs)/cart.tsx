import { useMemo } from 'react'
import { View, Text, Image, TextInput, Pressable, FlatList } from 'react-native'
import { useRouter } from 'expo-router'
import { useCart } from '@/app/context/CartContext'

export default function CartScreen() {
  const router = useRouter()
  const { items, updateQty, removeItem, total } = useCart()
  const empty = useMemo(() => items.length === 0, [items])

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '600' }}>Carrito</Text>
      {empty ? (
        <View style={{ marginTop: 16 }}>
          <Text>Tu carrito está vacío.</Text>
          <Pressable onPress={() => router.push('/(tabs)/catalog')} style={{ marginTop: 12, backgroundColor: '#111', paddingVertical: 10, borderRadius: 8, alignItems: 'center' }}>
            <Text style={{ color: 'white' }}>Explorar productos</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ marginTop: 16 }}>
          <FlatList
            data={items}
            keyExtractor={(i) => String(i.id)}
            renderItem={({ item }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#eee' }}>
                {item.img ? <Image source={{ uri: item.img }} style={{ width: 64, height: 64, borderRadius: 8 }} /> : null}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontWeight: '600' }}>{item.name}</Text>
                  <Text style={{ color: '#666' }}>${Number(item.price).toFixed(2)}</Text>
                </View>
                <TextInput
                  value={String(item.qty)}
                  onChangeText={(t) => updateQty(item.id, Math.max(1, parseInt(t || '1')))}
                  keyboardType="number-pad"
                  style={{ width: 56, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 8, height: 36 }}
                />
                <Pressable onPress={() => removeItem(item.id)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#eee', marginLeft: 8 }}>
                  <Text>Quitar</Text>
                </Pressable>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontSize: 16 }}>Total</Text>
            <Text style={{ marginTop: 4, fontSize: 28, fontWeight: '700' }}>${total.toFixed(2)}</Text>
            <Pressable onPress={() => router.push('/checkout')} style={{ marginTop: 12, backgroundColor: '#111', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '600' }}>Proceder al pago</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  )
}