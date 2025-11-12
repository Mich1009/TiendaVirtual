import { useEffect, useState } from 'react'
import { SafeAreaView, View, Text, Image, Button, ActivityIndicator, ScrollView } from 'react-native'
import { getProduct } from '../lib/api'
import { addToCart } from '../lib/cart'

export default function ProductDetail({ productId, onBack }) {
  const [prod, setProd] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    (async () => {
      try { setLoading(true); setError(''); setAdded(false)
        const data = await getProduct(productId)
        setProd(data)
      } catch (e) { setError(e.message) }
      finally { setLoading(false) }
    })()
  }, [productId])

  const onAdd = async () => {
    if (!prod) return
    await addToCart({ id: prod.id, name: prod.name, price: prod.price, image: (prod.images && prod.images[0]?.url) || null }, 1)
    setAdded(true)
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 24 }} />
  if (!prod) return <SafeAreaView><Text>Error</Text></SafeAreaView>
  const img = (prod.images && prod.images[0]?.url) || null
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        {img ? (
          <Image source={{ uri: img }} style={{ width: '100%', height: 260 }} resizeMode="cover" />
        ) : (
          <View className="h-64 bg-neutral-100 items-center justify-center"><Text className="text-neutral-500">Sin imagen</Text></View>
        )}
        <View className="p-4">
          <Text className="text-xl font-bold" numberOfLines={2}>{prod.name}</Text>
          <Text className="text-brand font-extrabold mt-2 text-lg">${prod.price}</Text>
          <Text className="text-neutral-600 mt-3">{prod.description}</Text>
          <View className="mt-4">
            <Button title={added ? 'Agregado al carrito' : 'Agregar al carrito'} onPress={onAdd} />
          </View>
          <View className="mt-4">
            <Button title="Volver" onPress={onBack} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}