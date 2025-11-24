import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, Image, StyleSheet, ScrollView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createOrder } from '@/lib/api'
import { useCart } from '@/context/CartContext'
import { getToken } from '@/lib/auth'
import { FalabellaColors } from '@/constants/theme'
import { IconSymbol } from '@/components/ui/icon-symbol'

export default function PagarScreen() {
  const router = useRouter()
  const { items, total, clear } = useCart()
  const [cardNumber, setCardNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shipping, setShipping] = useState<any>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const s = await AsyncStorage.getItem('settings.shipping')
        if (s) setShipping(JSON.parse(s))
        const p = await AsyncStorage.getItem('settings.payment')
        if (p) {
          const parsed = JSON.parse(p)
          if (parsed?.last4) setCardNumber(`•••• ${parsed.last4}`)
        }
      } catch {}
    })()
  }, [])

  async function manejarPago() {
    try {
      setLoading(true)
      setError('')
      
      const token = await getToken()
      if (!token) {
        Alert.alert('Sesión requerida', 'Debes iniciar sesión para continuar', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Iniciar sesión', onPress: () => router.push('/login') }
        ])
        return
      }

      let shippingData: any = {}
      let payment: any = {}
      
      try {
        const s = await AsyncStorage.getItem('settings.shipping')
        if (s) shippingData = JSON.parse(s)
        const p = await AsyncStorage.getItem('settings.payment')
        if (p) payment = JSON.parse(p)
      } catch {}

      if (!shippingData.fullName) {
        const nombres = ['Juan Pérez','María López','Carlos García','Ana Torres']
        const ciudades = ['Santiago','Valparaíso','Concepción','La Serena']
        shippingData = {
          fullName: nombres[Math.floor(Math.random()*nombres.length)],
          phone: `+569${Math.floor(10000000 + Math.random()*89999999)}`,
          address1: `Av. Principal ${Math.floor(Math.random()*2000)}`,
          address2: `Depto ${Math.floor(Math.random()*500)}`,
          city: ciudades[Math.floor(Math.random()*ciudades.length)],
          state: 'Región Metropolitana',
          zip: String(8000000 + Math.floor(Math.random()*999999)),
          country: 'Chile'
        }
      }

      const digits = (cardNumber || '').replace(/\D/g, '')
      payment = { ...payment, cardNumber: digits || '4111111111111111' }

      const payload = {
        items: items.map(i => ({ productId: i.id, quantity: i.qty })),
        shipping: shippingData,
        payment
      }

      await createOrder(token, payload)
      clear()
      
      Alert.alert(
        '¡Compra exitosa!',
        'Tu pedido ha sido procesado correctamente',
        [{ text: 'Ver mis pedidos', onPress: () => router.replace('/orders') }]
      )
    } catch (e: any) {
      setError(e.message || 'Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <IconSymbol name="cart" size={80} color={FalabellaColors.textMuted} />
        <Text style={styles.emptyTitle}>No hay productos</Text>
        <Text style={styles.emptySubtitle}>Agrega productos al carrito para continuar</Text>
        <Pressable onPress={() => router.push('/(tabs)/catalog')} style={styles.shopButton}>
          <Text style={styles.shopButtonText}>Ir a comprar</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de compra</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              {item.img ? (
                <Image source={{ uri: item.img }} style={styles.itemImage} resizeMode="cover" />
              ) : (
                <View style={[styles.itemImage, styles.placeholderImage]} />
              )}
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Cantidad: {item.qty}</Text>
              </View>
              <Text style={styles.itemPrice}>S/ {(item.price * item.qty).toLocaleString('es-PE')}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dirección de envío</Text>
            <Pressable onPress={() => router.push('/(tabs)/perfil')}>
              <Text style={styles.editLink}>Editar</Text>
            </Pressable>
          </View>
          {shipping ? (
            <View style={styles.addressCard}>
              <View style={styles.addressRow}>
                <IconSymbol name="person.fill" size={16} color={FalabellaColors.textLight} />
                <Text style={styles.addressText}>{shipping.fullName}</Text>
              </View>
              <View style={styles.addressRow}>
                <IconSymbol name="phone.fill" size={16} color={FalabellaColors.textLight} />
                <Text style={styles.addressText}>{shipping.phone}</Text>
              </View>
              <View style={styles.addressRow}>
                <IconSymbol name="location.fill" size={16} color={FalabellaColors.textLight} />
                <Text style={styles.addressText}>
                  {shipping.address1}, {shipping.city}, {shipping.country}
                </Text>
              </View>
            </View>
          ) : (
            <Pressable onPress={() => router.push('/(tabs)/perfil')} style={styles.addAddressButton}>
              <IconSymbol name="plus.circle.fill" size={24} color={FalabellaColors.primary} />
              <Text style={styles.addAddressText}>Agregar dirección de envío</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de pago</Text>
          <View style={styles.inputWrapper}>
            <IconSymbol name="creditcard.fill" size={20} color={FalabellaColors.textMuted} />
            <TextInput
              placeholder="Número de tarjeta"
              placeholderTextColor={FalabellaColors.textMuted}
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="number-pad"
              maxLength={19}
              style={styles.input}
            />
          </View>
          <Text style={styles.secureText}>
            <IconSymbol name="lock.fill" size={12} color={FalabellaColors.success} />
            {' '}Pago seguro y encriptado
          </Text>
        </View>

        {!!error && (
          <View style={styles.errorContainer}>
            <IconSymbol name="exclamationmark.circle.fill" size={20} color={FalabellaColors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>S/ {total.toLocaleString('es-PE')}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Envío</Text>
            <Text style={styles.freeText}>Gratis</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>S/ {total.toLocaleString('es-PE')}</Text>
          </View>
        </View>
        <Pressable 
          onPress={manejarPago} 
          disabled={loading} 
          style={[styles.payButton, loading && styles.payButtonDisabled]}
        >
          <Text style={styles.payButtonText}>
            {loading ? 'Procesando...' : 'Confirmar compra'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FalabellaColors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: FalabellaColors.white,
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FalabellaColors.text,
    marginBottom: 12,
  },
  editLink: {
    fontSize: 14,
    color: FalabellaColors.primary,
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: FalabellaColors.border,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: FalabellaColors.backgroundGray,
  },
  placeholderImage: {
    backgroundColor: FalabellaColors.border,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: FalabellaColors.text,
  },
  itemQuantity: {
    fontSize: 12,
    color: FalabellaColors.textMuted,
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: FalabellaColors.text,
  },
  addressCard: {
    backgroundColor: FalabellaColors.backgroundGray,
    padding: 16,
    borderRadius: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: FalabellaColors.text,
    marginLeft: 12,
    flex: 1,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: FalabellaColors.backgroundGray,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: FalabellaColors.border,
    borderStyle: 'dashed',
  },
  addAddressText: {
    fontSize: 14,
    color: FalabellaColors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FalabellaColors.backgroundGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: FalabellaColors.border,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: FalabellaColors.text,
  },
  secureText: {
    fontSize: 12,
    color: FalabellaColors.success,
    marginTop: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: FalabellaColors.error,
  },
  footer: {
    backgroundColor: FalabellaColors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: FalabellaColors.border,
  },
  totalContainer: {
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: FalabellaColors.textLight,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '500',
    color: FalabellaColors.text,
  },
  freeText: {
    fontSize: 14,
    fontWeight: '500',
    color: FalabellaColors.success,
  },
  divider: {
    height: 1,
    backgroundColor: FalabellaColors.border,
    marginVertical: 12,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: FalabellaColors.text,
  },
  grandTotalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: FalabellaColors.primary,
  },
  payButton: {
    backgroundColor: FalabellaColors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: FalabellaColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: FalabellaColors.white,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: FalabellaColors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: FalabellaColors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  shopButton: {
    marginTop: 24,
    backgroundColor: FalabellaColors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  shopButtonText: {
    color: FalabellaColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
})