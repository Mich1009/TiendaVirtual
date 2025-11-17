/**
 * Dashboard Administrativo
 * 
 * Muestra estadísticas generales del sistema:
 * - Total de productos
 * - Total de órdenes
 * - Total de usuarios
 * - Ventas totales
 */

import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { FalabellaColors } from '@/constants/theme'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { getToken } from '@/lib/auth'

export default function AdminPanelScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalSales: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      setLoading(true)
      const token = await getToken()
      
      if (!token) {
        router.replace('/login')
        return
      }

      // TODO: Implementar endpoints de estadísticas en el backend
      // Por ahora, datos de ejemplo
      setStats({
        totalProducts: 3,
        totalOrders: 0,
        totalUsers: 2,
        totalSales: 0
      })
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
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
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Panel de Administración</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Tarjetas de estadísticas */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScroll}
        >
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <IconSymbol name="cube.box.fill" size={32} color="#1976D2" />
            <Text style={styles.statValue}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>Productos</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
            <IconSymbol name="list.bullet.clipboard.fill" size={32} color="#7B1FA2" />
            <Text style={styles.statValue}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Órdenes</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <IconSymbol name="person.2.fill" size={32} color="#388E3C" />
            <Text style={styles.statValue}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Usuarios</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <IconSymbol name="dollarsign.circle.fill" size={32} color="#F57C00" />
            <Text style={styles.statValue}>S/ {stats.totalSales.toLocaleString('es-PE')}</Text>
            <Text style={styles.statLabel}>Ventas</Text>
          </View>
        </ScrollView>

        {/* Accesos rápidos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
          
          <Pressable 
            onPress={() => router.push('/(tabs)/admin-products')}
            style={styles.quickAction}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol name="cube.box.fill" size={24} color={FalabellaColors.primary} />
            </View>
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>Gestionar Productos</Text>
              <Text style={styles.quickActionSubtitle}>Crear, editar y eliminar productos</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={FalabellaColors.textMuted} />
          </Pressable>

          <Pressable 
            onPress={() => router.push('/(tabs)/admin-orders')}
            style={styles.quickAction}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol name="list.bullet.clipboard.fill" size={24} color={FalabellaColors.primary} />
            </View>
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>Ver Órdenes</Text>
              <Text style={styles.quickActionSubtitle}>Gestionar pedidos de clientes</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={FalabellaColors.textMuted} />
          </Pressable>

          <Pressable 
            onPress={() => router.push('/admin-categories')}
            style={styles.quickAction}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol name="folder.fill" size={24} color={FalabellaColors.primary} />
            </View>
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>Gestionar Categorías</Text>
              <Text style={styles.quickActionSubtitle}>Crear y editar categorías</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={FalabellaColors.textMuted} />
          </Pressable>

          <Pressable 
            onPress={() => router.push('/admin-users')}
            style={styles.quickAction}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol name="person.2.fill" size={24} color={FalabellaColors.primary} />
            </View>
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>Gestionar Usuarios</Text>
              <Text style={styles.quickActionSubtitle}>Crear y administrar usuarios</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={FalabellaColors.textMuted} />
          </Pressable>
        </View>
      </ScrollView>
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
    fontSize: 28,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    width: 140,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: FalabellaColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: FalabellaColors.text,
    marginTop: 12,
  },
  statLabel: {
    fontSize: 14,
    color: FalabellaColors.textLight,
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FalabellaColors.text,
    marginBottom: 12,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FalabellaColors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: FalabellaColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: FalabellaColors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    flex: 1,
    marginLeft: 16,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: FalabellaColors.text,
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: FalabellaColors.textMuted,
    marginTop: 2,
  },
})
