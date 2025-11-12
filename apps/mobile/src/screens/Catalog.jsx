import { useEffect, useState, useCallback } from 'react'
import { SafeAreaView, View, Text, Image, TouchableOpacity, ActivityIndicator, FlatList, TextInput, ScrollView } from 'react-native'
import { getProducts } from '../lib/api'

export default function Catalog({ onOpenProduct }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true); setError('')
      const data = await getProducts({ page: 1, limit: 100 })
      const list = Array.isArray(data) ? data : data.items || []
      setItems(list)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <ActivityIndicator style={{ marginTop: 24 }} />
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-4">
        <Text className="text-2xl font-bold">Productos</Text>
        {!!error && <Text className="text-red-500 mt-2">{error}</Text>}
      </View>
      <View className="px-4">
        <TextInput
          placeholder="Buscar productos"
          value={query}
          onChangeText={setQuery}
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
          {Array.from(new Set(items.map(i => i.category?.name).filter(Boolean))).map(c => (
            <TouchableOpacity key={c} onPress={() => setCategory(c === category ? '' : c)} className={`mr-2 px-3 py-2 rounded-md ${c === category ? 'bg-brand' : 'bg-neutral-100'}`}>
              <Text className={`${c === category ? 'text-white' : 'text-neutral-800'}`}>{c}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => { setQuery(''); setCategory('') }} className="px-3 py-2 rounded-md bg-neutral-100">
            <Text className="text-neutral-800">Limpiar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      {(() => {
        const filtered = items.filter(p => {
          const matchesQuery = query.trim() === '' || (p.name?.toLowerCase().includes(query.toLowerCase()) || p.description?.toLowerCase().includes(query.toLowerCase()))
          const matchesCategory = !category || p.category?.name === category
          return matchesQuery && matchesCategory
        })
        return (
          <FlatList
            data={filtered}
            numColumns={2}
            keyExtractor={(item) => String(item.id)}
            columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
            contentContainerStyle={{ gap: 12, paddingBottom: 24, paddingTop: 12 }}
            renderItem={({ item }) => {
              const img = (item.images && item.images[0]?.url) || null
              return (
                <TouchableOpacity className="flex-1" onPress={() => onOpenProduct(item.id)}>
                  <View className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                    {img ? (
                      <Image source={{ uri: img }} style={{ width: '100%', height: 120 }} resizeMode="cover" />
                    ) : (
                      <View className="h-28 bg-neutral-100 items-center justify-center"><Text className="text-neutral-500">Sin imagen</Text></View>
                    )}
                    <View className="p-3">
                      <Text className="font-semibold" numberOfLines={2}>{item.name}</Text>
                      <Text className="text-neutral-600" numberOfLines={1}>{item.category?.name || 'Categoría'}</Text>
                      <View className="mt-2 flex-row items-center justify-between">
                        <Text className="font-bold">${Number(item.price).toFixed(2)}</Text>
                        <Text className="text-brand">Ver</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            }}
          />
        )
      })()}
    </SafeAreaView>
  )
}