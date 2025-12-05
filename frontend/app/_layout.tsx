import { DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { CartProvider } from '@/context/CartContext'
import { AppConfigProvider } from '@/context/AppConfigContext'
import { ThemeProvider as CustomThemeProvider } from '@/context/ThemeContext'
import * as SystemUI from 'expo-system-ui'
import { useEffect } from 'react'
import { Platform } from 'react-native'
import { useAppConfig } from '@/context/AppConfigContext'


export const unstable_settings = {
  anchor: '(tabs)'
}

function RootLayoutContent() {
  const { config } = useAppConfig()

  useEffect(() => {
    SystemUI.setBackgroundColorAsync('#ffffff').catch(() => {})
    if (Platform.OS === 'web') {
      try {
        const meta = document.querySelector('meta[name="theme-color"]')
        if (meta) meta.setAttribute('content', '#ffffff')
        
        // Actualizar el título de la página con el nombre de la tienda
        document.title = config.storeName || 'Tienda'
        
        // Actualizar el favicon si hay logo
        if (config.storeLogo) {
          let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
          if (!favicon) {
            favicon = document.createElement('link')
            favicon.rel = 'icon'
            document.head.appendChild(favicon)
          }
          favicon.href = config.storeLogo
        }
        
        const style = document.createElement('style')
        style.innerHTML = `:root, html, body, #root { background: #ffffff !important; color: #11181C !important; color-scheme: light !important; }
        @media (prefers-color-scheme: dark) { :root, html, body, #root { background: #ffffff !important; color: #11181C !important; color-scheme: light !important; } }`
        document.head.appendChild(style)
      } catch {}
    }
  }, [config.storeName, config.storeLogo])
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="product/[id]" options={{ title: 'Producto' }} />
      <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
      <Stack.Screen name="orders" options={{ title: 'Mis pedidos' }} />
      <Stack.Screen name="login" options={{ title: 'Iniciar sesión' }} />
      <Stack.Screen name="register" options={{ title: 'Registrarse' }} />
      <Stack.Screen name="recuperar-contrasena" options={{ title: 'Recuperar contraseña' }} />
      <Stack.Screen name="admin-categories" options={{ title: 'Categorías' }} />
      <Stack.Screen name="admin-users" options={{ title: 'Usuarios' }} />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <CustomThemeProvider>
      <ThemeProvider value={DefaultTheme}>
        <AppConfigProvider>
          <CartProvider>
            <RootLayoutContent />
            <StatusBar style="dark" />
          </CartProvider>
        </AppConfigProvider>
      </ThemeProvider>
    </CustomThemeProvider>
  )
}
