/**
 * Gestión de Órdenes (Admin)
 * 
 * Permite al administrador:
 * - Ver todas las órdenes del sistema
 * - Cambiar estado de órdenes
 * - Ver detalles de cada orden
 */

import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Alert, Modal, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { FalabellaColors } from '@/constants/theme'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { getToken } from '@/lib/auth'
import { getAllOrders, updateOrderStatus } from '@/lib/api'

type Order = {
  id: number
  total: number
  status: string
  created_at: string
  user_id: number
  shipping_name?: string
  shipping_phone?: string
  shipping_address1?: string
  shipping_city?: string
}

const STATUS_COLORS: Record<string, string> = {
  PAID: '#2196F3',
  SHIPPED: '#FF9800',
  DELIVERED: '#4CAF50',
  CANCELLED: '#F44336'
}

const STATUS_LABELS: Record<string, string> = {
  PAID: 'Pagado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado'
}

const STATUS_OPTIONS = ['PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function AdminOrdersScreen() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    try {
      setLoading(true)
      const token = await getToken()
      
      if (!token) {
        router.replace('/login')
        return
      }

      const data = await getAllOrders(token, { page: 1, limit: 100 })
      setOrders(Array.isArray(data.items) ? data.items : [])
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al cargar órdenes')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(order: Order, newStatus: string) {
    try {
      const token = await getToken()
      if (!token) return

      await updateOrderStatus(token, order.id, newStatus)
      Alert.alert('Éxito', 'Estado actualizado correctamente')
      setModalVisible(false)
      loadOrders()
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al actualizar estado')
    }
  }

  function openOrderDetail(order: Order) {
    setSelectedOrder(order)
    setModalVisible(true)
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Gestión de Órdenes</Text>
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
        <Text style={styles.title}>Gestión de Órdenes</Text>
        <Text style={styles.subtitle}>{orders.length} órdenes</Text>
      </View>

      {/* Lista de órdenes */}
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable onPress={() => openOrderDetail(item)} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>Orden #{item.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
                <Text style={styles.statusText}>{STATUS_LABELS[item.status]}</Text>
              </View>
            </View>
            <View style={styles.orderInfo}>
              <View style={styles.orderRow}>
                <IconSymbol name="person.fill" size={16} color={FalabellaColors.textMuted} />
                <Text style={styles.orderText}>{item.shipping_name || 'Sin nombre'}</Text>
              </View>
              <View style={styles.orderRow}>
                <IconSymbol name="dollarsign.circle.fill" size={16} color={FalabellaColors.textMuted} />
                <Text style={styles.orderText}>S/ {item.total.toLocaleString('es-PE')}</Text>
              </View>
              <View style={styles.orderRow}>
                <IconSymbol name="calendar" size={16} color={FalabellaColors.textMuted} />
                <Text style={styles.orderText}>
                  {new Date(item.created_at).toLocaleDateString('es-CL')}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="list.bullet.clipboard" size={64} color={FalabellaColors.textMuted} />
            <Text style={styles.emptyText}>No hay órdenes</Text>
          </View>
        }
      />

      {/* Modal de detalle */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Orden #{selectedOrder?.id}</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <IconSymbol name="xmark" size={24} color={FalabellaColors.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              {selectedOrder && (
                <>
                  {/* Estado actual */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Estado Actual</Text>
                    <View style={[styles.statusBadgeLarge, { backgroundColor: STATUS_COLORS[selectedOrder.status] }]}>
                      <Text style={styles.statusTextLarge}>{STATUS_LABELS[selectedOrder.status]}</Text>
                    </View>
                  </View>

                  {/* Cambiar estado */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cambiar Estado</Text>
                    <View style={styles.statusGrid}>
                      {STATUS_OPTIONS.map((status) => (
                        <Pressable
                          key={status}
                          onPress={() => handleStatusChange(selectedOrder, status)}
                          style={[
                            styles.statusOption,
                            { borderColor: STATUS_COLORS[status] },
                            selectedOrder.status === status && { backgroundColor: STATUS_COLORS[status] }
                          ]}
                        >
                          <Text style={[
                            styles.statusOptionText,
                            { color: STATUS_COLORS[status] },
                            selectedOrder.status === status && { color: FalabellaColors.white }
                          ]}>
                            {STATUS_LABELS[status]}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Información del cliente */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Información del Cliente</Text>
                    <View style={styles.infoRow}>
                      <IconSymbol name="person.fill" size={20} color={FalabellaColors.primary} />
                      <View style={styles.infoText}>
                        <Text style={styles.infoLabel}>Nombre</Text>
                        <Text style={styles.infoValue}>{selectedOrder.shipping_name || 'N/A'}</Text>
                      </View>
                    </View>
                    <View style={styles.infoRow}>
                      <IconSymbol name="phone.fill" size={20} color={FalabellaColors.primary} />
                      <View style={styles.infoText}>
                        <Text style={styles.infoLabel}>Teléfono</Text>
                        <Text style={styles.infoValue}>{selectedOrder.shipping_phone || 'N/A'}</Text>
                      </View>
                    </View>
                    <View style={styles.infoRow}>
                      <IconSymbol name="location.fill" size={20} color={FalabellaColors.primary} />
                      <View style={styles.infoText}>
                        <Text style={styles.infoLabel}>Dirección</Text>
                        <Text style={styles.infoValue}>
                          {selectedOrder.shipping_address1 || 'N/A'}
                          {selectedOrder.shipping_city && `, ${selectedOrder.shipping_city}`}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Total */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Total</Text>
                    <Text style={styles.totalAmount}>S/ {selectedOrder.total.toLocaleString('es-PE')}</Text>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: FalabellaColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: FalabellaColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: FalabellaColors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: FalabellaColors.white,
  },
  orderInfo: {
    gap: 8,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderText: {
    fontSize: 14,
    color: FalabellaColors.textLight,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: FalabellaColors.textMuted,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: FalabellaColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: FalabellaColors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: FalabellaColors.text,
  },
  modalScroll: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FalabellaColors.text,
    marginBottom: 12,
  },
  statusBadgeLarge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusTextLarge: {
    fontSize: 16,
    fontWeight: '700',
    color: FalabellaColors.white,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: FalabellaColors.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: FalabellaColors.text,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: FalabellaColors.primary,
  },
})

// Nota: Los botones de estado en órdenes ya tienen texto descriptivo (Pagado, Enviado, etc.)
