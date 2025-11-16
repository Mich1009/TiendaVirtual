import { useEffect, useState } from 'react'
import { View, Text, Image, Pressable, ActivityIndicator, ScrollView, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { getProduct } from '@/lib/api'
import { useCart } from '@/context/CartContext'
import { FalabellaColors } from '@/constants/theme'
import { IconSymbol } from '@/components/ui/icon-symbol'

type Product = { id: number; name: string; description?: string; price: number; images?: { url: string }[]; stock?: number }

export default function ProductDetail() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)

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

  const handleAddToCart = () => {
    if (!product) return
    const img = product.images?.[0]?.url || 'https://via.placeholder.com/800x500?text=Producto'
    addItem({ id: product.id, name: product.name, price: product.price, img, qty: 1 })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={FalabellaColors.primary} />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <IconSymbol name="exclamationmark.triangle" size={60} color={FalabellaColors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver</Text>
        </Pressable>
      </View>
    )
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Producto no disponible</Text>
      </View>
    )
  }

  const img = product.images?.[0]?.url || 'https://via.placeholder.com/800x500?text=Producto'

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Image source={{ uri: img }} style={styles.productImage} resizeMode="cover" />
        
        <View style={styles.contentContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>${Number(product.price).toLocaleString('es-CL')}</Text>
            {product.stock !== undefined && (
              <View style={styles.stockBadge}>
                <Text style={styles.stockText}>
                  {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>
              {product.description || 'Este producto no tiene descripción disponible.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Características</Text>
            <View style={styles.featureRow}>
              <IconSymbol name="checkmark.circle.fill" size={20} color={FalabellaColors.success} />
              <Text style={styles.featureText}>Envío gratis</Text>
            </View>
            <View style={styles.featureRow}>
              <IconSymbol name="checkmark.circle.fill" size={20} color={FalabellaColors.success} />
              <Text style={styles.featureText}>Garantía de calidad</Text>
            </View>
            <View style={styles.featureRow}>
              <IconSymbol name="checkmark.circle.fill" size={20} color={FalabellaColors.success} />
              <Text style={styles.featureText}>Devolución fácil</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={handleAddToCart}
          style={[styles.addButton, added && styles.addButtonSuccess]}
          disabled={added}
        >
          <IconSymbol 
            name={added ? "checkmark.circle.fill" : "cart.fill"} 
            size={20} 
            color={FalabellaColors.white} 
          />
          <Text style={styles.addButtonText}>
            {added ? 'Agregado al carrito' : 'Agregar al carrito'}
          </Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(tabs)/cart')} style={styles.viewCartButton}>
          <IconSymbol name="cart" size={20} color={FalabellaColors.primary} />
          <Text style={styles.viewCartText}>Ver carrito</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FalabellaColors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  scrollView: {
    flex: 1,
  },
  productImage: {
    width: '100%',
    height: 400,
    backgroundColor: FalabellaColors.backgroundGray,
  },
  contentContainer: {
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: FalabellaColors.text,
    lineHeight: 32,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  productPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: FalabellaColors.primary,
  },
  stockBadge: {
    backgroundColor: FalabellaColors.backgroundGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  stockText: {
    fontSize: 12,
    color: FalabellaColors.textLight,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: FalabellaColors.border,
    marginVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FalabellaColors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: FalabellaColors.textLight,
    lineHeight: 22,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: FalabellaColors.text,
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: FalabellaColors.white,
    borderTopWidth: 1,
    borderTopColor: FalabellaColors.border,
    gap: 12,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: FalabellaColors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonSuccess: {
    backgroundColor: FalabellaColors.success,
  },
  addButtonText: {
    color: FalabellaColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  viewCartButton: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: FalabellaColors.primary,
    gap: 8,
  },
  viewCartText: {
    color: FalabellaColors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 16,
    color: FalabellaColors.error,
    textAlign: 'center',
    marginTop: 16,
  },
  backButton: {
    marginTop: 24,
    backgroundColor: FalabellaColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  backButtonText: {
    color: FalabellaColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
})