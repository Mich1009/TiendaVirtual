import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native'
import { getOrders } from '@/lib/api'
import { getToken } from '@/lib/auth'
import { FalabellaColors } from '@/constants/theme'
import { IconSymbol } from '@/components/ui/icon-symbol'

type OrderItem = { 
  order_id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  product_image?: string
}

type Order = { 
  id: number
  total: number
  status: string
  created_at: string
  estimatedDelivery?: string
  items: OrderItem[]
}

// Función para formatear fecha de entrega
function formatDeliveryDate(dateString: string): string {
  const date = new Date(dateString)
  
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  
  return date.toLocaleDateString('es-PE', options)
}

// Función para verificar si un pedido ya fue entregado
function isDelivered(status: string, estimatedDelivery?: string): boolean {
  if (status !== 'PAID' || !estimatedDelivery) return false
  
  const deliveryDate = new Date(estimatedDelivery)
  const now = new Date()
  
  // Comparar solo fechas (sin horas)
  // Si la fecha de entrega es 17/11, se marca como entregado a partir del 18/11
  const deliveryDay = new Date(deliveryDate.getFullYear(), deliveryDate.getMonth(), deliveryDate.getDate())
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  // Debe ser DESPUÉS de la fecha de entrega (no el mismo día)
  return today > deliveryDay
}

// Función para obtener el color y texto del estado
function getStatusInfo(status: string, estimatedDelivery?: string) {
  // Si el estado es DELIVERED o ya pasó la fecha de entrega
  if (status === 'DELIVERED' || isDelivered(status, estimatedDelivery)) {
    return { text: 'Entregado', color: '#2196F3', icon: 'checkmark.seal.fill' }
  }
  
  switch (status) {
    case 'PENDING':
      return { text: 'Pendiente', color: '#FF9800', icon: 'clock.fill' }
    case 'PAID':
      return { text: 'En camino', color: '#4CAF50', icon: 'shippingbox.fill' }
    case 'CANCELLED':
      return { text: 'Cancelado', color: '#F44336', icon: 'xmark.circle.fill' }
    default:
      return { text: status, color: '#757575', icon: 'questionmark.circle.fill' }
  }
}

export default function PedidosScreen() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarPedidos()
  }, [])

  async function cargarPedidos() {
    try {
      setLoading(true)
      const token = await getToken()
      if (!token) { 
        setError('Inicia sesión para ver tus pedidos')
        return 
      }
      const list = await getOrders(token)
      setOrders(Array.isArray(list) ? list as any : [])
      setError('')
    } catch (e: any) {
      setError(e.message || 'Error al obtener pedidos')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mis Pedidos</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={FalabellaColors.primary} />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Pedidos</Text>
        <Text style={styles.subtitle}>{orders.length} pedidos realizados</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" size={48} color={FalabellaColors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="bag" size={64} color={FalabellaColors.textMuted} />
          <Text style={styles.emptyText}>No tienes pedidos aún</Text>
          <Text style={styles.emptySubtext}>Tus compras aparecerán aquí</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status, order.estimatedDelivery)
            const estimatedDelivery = order.estimatedDelivery 
              ? formatDeliveryDate(order.estimatedDelivery)
              : 'Fecha no disponible'
            
            return (
              <View key={order.id} style={styles.orderCard}>
                {/* Header del pedido */}
                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderLeft}>
                    <Text style={styles.orderId}>Pedido #{order.id}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                      <IconSymbol name={statusInfo.icon as any} size={14} color={statusInfo.color} />
                      <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {statusInfo.text}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.orderTotal}>S/ {Number(order.total).toFixed(2)}</Text>
                </View>

                {/* Fecha de pedido y entrega estimada */}
                <View style={styles.orderDates}>
                  <View style={styles.dateRow}>
                    <IconSymbol name="calendar" size={16} color={FalabellaColors.textMuted} />
                    <Text style={styles.dateText}>
                      Pedido: {new Date(order.created_at).toLocaleDateString('es-PE')}
                    </Text>
                  </View>
                  {(order.status === 'PAID' || order.status === 'DELIVERED' || statusInfo.text === 'Entregado') && order.estimatedDelivery && (
                    <View style={styles.dateRow}>
                      <IconSymbol 
                        name={statusInfo.text === 'Entregado' ? 'checkmark.seal.fill' : 'shippingbox.fill'} 
                        size={16} 
                        color={statusInfo.text === 'Entregado' ? '#2196F3' : FalabellaColors.primary} 
                      />
                      <Text style={[
                        styles.deliveryText,
                        statusInfo.text === 'Entregado' && { color: '#2196F3' }
                      ]}>
                        {statusInfo.text === 'Entregado' ? 'Entregado el: ' : 'Entrega estimada: '}
                        {estimatedDelivery}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Productos */}
                <View style={styles.productsContainer}>
                  <Text style={styles.productsTitle}>Productos ({order.items?.length || 0})</Text>
                  {order.items?.map((item, idx) => (
                    <View key={idx} style={styles.productItem}>
                      {item.product_image ? (
                        <Image 
                          source={{ uri: item.product_image }} 
                          style={styles.productImage}
                        />
                      ) : (
                        <View style={styles.productImagePlaceholder}>
                          <IconSymbol name="photo" size={24} color={FalabellaColors.textMuted} />
                        </View>
                      )}
                      <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>
                          {item.product_name}
                        </Text>
                        <Text style={styles.productQuantity}>
                          Cantidad: {item.quantity}
                        </Text>
                        <Text style={styles.productPrice}>
                          S/ {Number(item.unit_price).toFixed(2)} c/u
                        </Text>
                      </View>
                      <Text style={styles.productSubtotal}>
                        S/ {(item.quantity * Number(item.unit_price)).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )
          })}
        </ScrollView>
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: FalabellaColors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: FalabellaColors.text,
  },
  subtitle: {
    fontSize: 14,
    color: FalabellaColors.textMuted,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: FalabellaColors.error,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: FalabellaColors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: FalabellaColors.textMuted,
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: FalabellaColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: FalabellaColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    color: FalabellaColors.text,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: FalabellaColors.primary,
  },
  orderDates: {
    backgroundColor: FalabellaColors.backgroundGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 13,
    color: FalabellaColors.textLight,
  },
  deliveryText: {
    fontSize: 13,
    fontWeight: '600',
    color: FalabellaColors.primary,
  },
  productsContainer: {
    borderTopWidth: 1,
    borderTopColor: FalabellaColors.border,
    paddingTop: 12,
  },
  productsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: FalabellaColors.text,
    marginBottom: 12,
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: FalabellaColors.backgroundGray,
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: FalabellaColors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: FalabellaColors.text,
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 12,
    color: FalabellaColors.textMuted,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 12,
    color: FalabellaColors.textLight,
  },
  productSubtotal: {
    fontSize: 14,
    fontWeight: '700',
    color: FalabellaColors.text,
    alignSelf: 'center',
  },
})