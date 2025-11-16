/**
 * Layout de Tabs - Navegación Principal
 * 
 * Muestra diferentes tabs según el rol del usuario:
 * - CUSTOMER: Catálogo, Carrito, Perfil
 * - ADMIN: Dashboard, Productos, Órdenes, Usuarios, Perfil
 */

import { Tabs } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { HapticTab } from '@/components/haptic-tab'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { FalabellaColors } from '@/constants/theme'
import { getUser } from '@/lib/auth'

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
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="cart.fill" color={color} />,
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
