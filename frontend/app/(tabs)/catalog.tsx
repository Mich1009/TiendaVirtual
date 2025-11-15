import { useEffect, useState } from 'react'
import { View, Text, TextInput, FlatList, Image, Pressable, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { getProducts, getCategories } from '@/app/lib/api'

type Product = { id: number; name: string; description?: string; price: number; images?: { url: string }[]; category?: { id: number; name: string; slug: string } }
type Category = { id: number; name: string; slug: string }

export default function CatalogScreen() {
  const router = useRouter()
  const [items, setItems] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const [prods, cats] = await Promise.all([
          getProducts({ search: query || undefined, category: category || undefined, sort: 'created_desc', page: 1, limit: 30 }),
          getCategories()
        ])
        const list = Array.isArray((prods as any).items) ? (prods as any).items : Array.isArray(prods) ? prods as any : []
        setItems(list)
        setCategories(Array.isArray(cats) ? cats as any : [])
        setError('')
      } catch (e: any) {
        setError(e.message || 'Error al cargar productos')
      } finally {
        setLoading(false)
      }
    })()
  }, [query, category])

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '600' }}>Productos</Text>
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <TextInput
          placeholder="Buscar productos"
          value={query}
          onChangeText={setQuery}
          style={{ flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40, marginRight: 8 }}
        />
        <Pressable onPress={() => { setQuery(''); setCategory('') }} style={{ paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#111', justifyContent: 'center' }}>
          <Text style={{ color: 'white' }}>Limpiar</Text>
        </Pressable>
      </View>
      <FlatList
        horizontal
        data={[{ id: 0, name: 'Todas', slug: '' } as any, ...categories]}
        keyExtractor={(c) => String(c.id) + c.slug}
        style={{ marginTop: 8 }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable onPress={() => setCategory(item.slug)} style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: (category === item.slug) ? '#111' : '#eee', borderRadius: 16, marginRight: 8 }}>
            <Text style={{ color: (category === item.slug) ? '#fff' : '#333' }}>{item.name}</Text>
          </Pressable>
        )}
      />
      {loading && (
        <View style={{ marginTop: 16 }}>
          <ActivityIndicator />
        </View>
      )}
      {!!error && <Text style={{ marginTop: 16, color: 'red' }}>{error}</Text>}
      {!loading && !error && (
        <FlatList
          data={items}
          keyExtractor={(p) => String(p.id)}
          numColumns={2}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
          renderItem={({ item }) => {
            const img = item.images?.[0]?.url || 'https://via.placeholder.com/600x400?text=Producto'
            return (
              <Pressable onPress={() => router.push(`/product/${item.id}`)} style={{ flex: 1, backgroundColor: 'white', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#eee', margin: 6 }}>
                <Image source={{ uri: img }} style={{ width: '100%', height: 140 }} />
                <View style={{ padding: 12 }}>
                  <Text numberOfLines={2} style={{ fontWeight: '600' }}>{item.name}</Text>
                  <Text style={{ marginTop: 4, color: '#666' }}>{item.category?.name || 'Categoría'}</Text>
                  <Text style={{ marginTop: 8, fontWeight: '700' }}>${Number(item.price).toFixed(2)}</Text>
                </View>
              </Pressable>
            )
          }}
        />
      )}
    </View>
  )
}