import { useEffect, useState } from 'react'
import { View, Text, TextInput, FlatList, Image, Pressable, ActivityIndicator, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { getProducts, getCategories } from '@/lib/api'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { FalabellaColors } from '@/constants/theme'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { useAppConfig } from '@/context/AppConfigContext'

type Product = { id: number; name: string; description?: string; price: number; images?: { url: string }[]; category?: { id: number; name: string; slug: string } }
type Category = { id: number; name: string; slug: string }

export default function CatalogoScreen() {
  const router = useRouter()
  const { config } = useAppConfig()
  const [items, setItems] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')

  // Log para debug
  useEffect(() => {
    console.log('📱 Catálogo - Config actual:', {
      nombre: config.storeName,
      tienelogo: !!config.storeLogo,
      fuente: config.fontFamily
    })
  }, [config])

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
    <View style={styles.container}>
      {/* Header con logo y búsqueda */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {config.storeLogo && (
            <Image 
              key={config.storeLogo} 
              source={{ uri: config.storeLogo }} 
              style={styles.logoImage} 
            />
          )}
          <Text style={styles.logo}>{config.storeName}</Text>
        </View>
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color={FalabellaColors.textMuted} />
          <TextInput
            placeholder="¿Qué estás buscando?"
            placeholderTextColor={FalabellaColors.textMuted}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
          {query ? (
            <Pressable onPress={() => { setQuery(''); setCategory('') }}>
              <IconSymbol name="xmark.circle.fill" size={20} color={FalabellaColors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Categorías */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {[{ id: 0, name: 'Todas', slug: '' } as any, ...categories].map((item) => (
            <Pressable 
              key={String(item.id) + item.slug}
              onPress={() => setCategory(item.slug)} 
              style={[
                styles.categoryChip,
                category === item.slug && styles.categoryChipActive
              ]}
            >
              <Text style={[
                styles.categoryText,
                category === item.slug && styles.categoryTextActive
              ]}>{item.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Productos */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={FalabellaColors.primary} />
        </View>
      )}
      {!!error && <Text style={styles.errorText}>{error}</Text>}
      {!loading && !error && (
        <FlatList
          data={items}
          keyExtractor={(p) => String(p.id)}
          numColumns={2}
          contentContainerStyle={styles.productList}
          columnWrapperStyle={styles.productRow}
          renderItem={({ item }) => {
            const img = item.images?.[0]?.url || 'https://via.placeholder.com/600x400?text=Producto'
            return (
              <Pressable onPress={() => router.push(`/product/${item.id}`)} style={styles.productCard}>
                <Image source={{ uri: img }} style={styles.productImage} resizeMode="cover" />
                <View style={styles.productInfo}>
                  <Text numberOfLines={2} style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productCategory}>{item.category?.name || 'Categoría'}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.productPrice}>S/ {Number(item.price).toLocaleString('es-PE')}</Text>
                  </View>
                </View>
              </Pressable>
            )
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FalabellaColors.backgroundGray,
  },
  header: {
    backgroundColor: FalabellaColors.white,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: FalabellaColors.border,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: FalabellaColors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FalabellaColors.backgroundGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: FalabellaColors.text,
  },
  categoriesContainer: {
    backgroundColor: FalabellaColors.white,
    borderBottomWidth: 1,
    borderBottomColor: FalabellaColors.border,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: FalabellaColors.backgroundGray,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: FalabellaColors.border,
  },
  categoryChipActive: {
    backgroundColor: FalabellaColors.primary,
    borderColor: FalabellaColors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: FalabellaColors.text,
  },
  categoryTextActive: {
    color: FalabellaColors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    margin: 16,
    color: FalabellaColors.error,
    textAlign: 'center',
  },
  productList: {
    padding: 8,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    flex: 1,
    backgroundColor: FalabellaColors.white,
    borderRadius: 8,
    margin: 6,
    overflow: 'hidden',
    shadowColor: FalabellaColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 160,
    backgroundColor: FalabellaColors.backgroundGray,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: FalabellaColors.text,
    marginBottom: 4,
    minHeight: 36,
  },
  productCategory: {
    fontSize: 12,
    color: FalabellaColors.textMuted,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: FalabellaColors.primary,
  },
})