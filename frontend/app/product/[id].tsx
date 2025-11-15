import { useEffect, useState } from 'react'
import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { getProduct } from '@/app/lib/api'
import { useCart } from '@/app/context/CartContext'

type Product = { id: number; name: string; description?: string; price: number; images?: { url: string }[] }

export default function ProductDetail() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const data = await getProduct(String(id))
        setProduct(data as any)
        setError('')
      } catch (e: any) {
        setError(e.message || 'Error al cargar el producto')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>
  if (error) return <View style={{ padding: 16 }}><Text style={{ color: 'red' }}>{error}</Text></View>
  if (!product) return <View style={{ padding: 16 }}><Text>Producto no disponible</Text></View>

  const img = product.images?.[0]?.url || 'https://via.placeholder.com/800x500?text=Producto'

  return (
    <View style={{ flex: 1 }}>
      <Image source={{ uri: img }} style={{ width: '100%', height: 300 }} />
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '600' }}>{product.name}</Text>
        <Text style={{ marginTop: 8, color: '#666' }}>{product.description || 'Sin descripción'}</Text>
        <Text style={{ marginTop: 12, fontSize: 24, fontWeight: '700' }}>${Number(product.price).toFixed(2)}</Text>
        <Pressable
          onPress={() => { addItem({ id: product.id, name: product.name, price: product.price, img, qty: 1 }); router.push('/(tabs)/cart') }}
          style={{ marginTop: 16, backgroundColor: '#111', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Añadir al carrito</Text>
        </Pressable>
      </View>
    </View>
  )
}