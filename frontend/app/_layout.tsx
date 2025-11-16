import { DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { CartProvider } from '@/context/CartContext'
import { AppConfigProvider } from '@/context/AppConfigContext'
import * as SystemUI from 'expo-system-ui'
import { useEffect } from 'react'
import { Platform } from 'react-native'

export const unstable_settings = {
  anchor: '(tabs)'
}

export default function RootLayout() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync('#ffffff').catch(() => {})
    if (Platform.OS === 'web') {
      try {
        const meta = document.querySelector('meta[name="theme-color"]')
        if (meta) meta.setAttribute('content', '#ffffff')
        const style = document.createElement('style')
        style.innerHTML = `:root, html, body, #root { background: #ffffff !important; color: #11181C !important; color-scheme: light !important; }
        @media (prefers-color-scheme: dark) { :root, html, body, #root { background: #ffffff !important; color: #11181C !important; color-scheme: light !important; } }`
        document.head.appendChild(style)
      } catch {}
    }
  }, [])
  return (
    <ThemeProvider value={DefaultTheme}>
      <AppConfigProvider>
        <CartProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="product/[id]" options={{ title: 'Producto' }} />
            <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
            <Stack.Screen name="orders" options={{ title: 'Mis pedidos' }} />
            <Stack.Screen name="login" options={{ title: 'Iniciar sesión' }} />
            <Stack.Screen name="register" options={{ title: 'Registrarse' }} />
            <Stack.Screen name="admin-categories" options={{ title: 'Categorías' }} />
            <Stack.Screen name="admin-users" options={{ title: 'Usuarios' }} />
          </Stack>
          <StatusBar style="dark" />
        </CartProvider>
      </AppConfigProvider>
    </ThemeProvider>
  )
}
