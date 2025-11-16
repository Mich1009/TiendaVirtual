/**
 * Layout de Tabs - Navegación Principal
 * 
 * Muestra diferentes tabs según el rol del usuario:
 * - CUSTOMER: Catálogo, Carrito, Perfil
 * - ADMIN: Dashboard, Productos, Órdenes, Usuarios, Perfil
 */

import { Tabs } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { HapticTab } from '@/components/haptic-tab'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { FalabellaColors } from '@/constants/theme'
import { getUser } from '@/lib/auth'
import { useCart } from '@/context/CartContext'

// Componente para el icono del carrito con badge
function CartIcon({ color }: { color: string }) {
  const { items } = useCart()
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0)
  
  return (
    <View style={{ width: 28, height: 28 }}>
      <IconSymbol size={28} name="cart.fill" color={color} />
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
        </View>
      )}
    </View>
  )
}

export default function TabLayout() {
  const [userRole, setUserRole] = useState<'CUSTOMER' | 'ADMIN' | null>(null)
  const [loading, setLoading] = useState(true)

  // Detectar el rol del usuario al cargar
  useEffect(() => {
    checkUserRole()
  }, [])

  async function checkUserRole() {
    try {
      const user = await getUser()
      setUserRole(user?.role || null)
    } catch (error) {
      console.error('Error obteniendo rol:', error)
      setUserRole(null)
    } finally {
      setLoading(false)
    }
  }

  // Mientras carga, mostrar tabs básicos
  if (loading) {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: FalabellaColors.primary,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
        <Tabs.Screen
          name="catalog"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
      </Tabs>
    )
  }

  // Si es ADMIN, mostrar tabs administrativos
  if (userRole === 'ADMIN') {
    return (
      <Tabs
        initialRouteName="admin-dashboard"
        screenOptions={{
          tabBarActiveTintColor: FalabellaColors.primary,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
        <Tabs.Screen
          name="admin-dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="admin-products"
          options={{
            title: 'Productos',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="cube.box.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="admin-orders"
          options={{
            title: 'Órdenes',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet.clipboard.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          }}
        />
        {/* Ocultar admin-settings del tab bar */}
        <Tabs.Screen
          name="admin-settings"
          options={{
            href: null,
          }}
        />
        {/* Ocultar tabs de cliente para admin */}
        <Tabs.Screen
          name="catalog"
          options={{
            href: null, // Ocultar del tab bar
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            href: null, // Ocultar del tab bar
          }}
        />
      </Tabs>
    )
  }

  // Si es CUSTOMER o no autenticado, mostrar tabs de cliente
  return (
    <Tabs
      initialRouteName="catalog"
      screenOptions={{
        tabBarActiveTintColor: FalabellaColors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Carrito',
          tabBarIcon: ({ color }) => <CartIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      {/* Ocultar tabs de admin para clientes */}
      <Tabs.Screen
        name="admin-dashboard"
        options={{
          href: null, // Ocultar del tab bar
        }}
      />
      <Tabs.Screen
        name="admin-products"
        options={{
          href: null, // Ocultar del tab bar
        }}
      />
      <Tabs.Screen
        name="admin-orders"
        options={{
          href: null, // Ocultar del tab bar
        }}
      />
      <Tabs.Screen
        name="admin-settings"
        options={{
          href: null, // Ocultar del tab bar
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -6,
    top: -4,
    backgroundColor: FalabellaColors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: FalabellaColors.white,
    fontSize: 11,
    fontWeight: '700',
  },
})
