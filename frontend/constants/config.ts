/**
 * Configuración de la aplicación
 * 
 * Soporta múltiples entornos:
 * - Desarrollo local (localhost)
 * - Desarrollo en red local (IP local)
 * - Producción (servidor público)
 */

import Constants from 'expo-constants'
import { Platform } from 'react-native'

/**
 * Obtiene las URLs del API desde app.json
 */
const extra = (Constants?.expoConfig?.extra as any) || {}

// URLs configuradas en app.json
const API_URL_WEB = extra.API_URL || 'http://localhost:4000/v1'
const API_URL_MOBILE = extra.API_URL_MOBILE || 'http://localhost:4000/v1'
const API_URL_PRODUCTION = extra.API_URL_PRODUCTION || null

/**
 * Determina qué URL usar según el entorno y plataforma
 * 
 * Prioridad:
 * 1. Variable de entorno EXPO_PUBLIC_API_URL (solo para móvil)
 * 2. API_URL_PRODUCTION si está configurada y no es desarrollo
 * 3. URL específica de la plataforma (web/mobile)
 */
function getApiUrl(): string {
  // 1. Para WEB siempre usar localhost
  if (Platform.OS === 'web') {
    console.log('🌐 Usando localhost para web')
    return API_URL_WEB
  }

  // 2. Para móvil, verificar variable de entorno primero
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL
  if (envApiUrl) {
    console.log('🌐 Usando API URL de variable de entorno (móvil)')
    return envApiUrl
  }

  // 3. Si hay URL de producción configurada y no estamos en desarrollo
  if (API_URL_PRODUCTION && API_URL_PRODUCTION !== 'https://tu-backend.railway.app/v1' && !__DEV__) {
    console.log('🌐 Usando API URL de producción')
    return API_URL_PRODUCTION
  }

  // 4. Usar URL según la plataforma
  const platformUrl = Platform.select({
    web: API_URL_WEB,           // Web usa localhost
    android: API_URL_MOBILE,    // Android usa IP de la red
    ios: API_URL_MOBILE,        // iOS usa IP de la red
    default: API_URL_WEB        // Fallback a web
  }) as string

  console.log(`🌐 Usando URL de plataforma ${Platform.OS}`)
  return platformUrl
}

// URL final que se usará para todas las peticiones
export const API_URL = getApiUrl()

// Log para debugging
console.log('🌐 Plataforma:', Platform.OS)
console.log('🔧 Modo:', __DEV__ ? 'Desarrollo' : 'Producción')
console.log('🔗 API URL:', API_URL)

// Remover /v1 del final para obtener la URL base sin versión
export const API_BASE_URL = API_URL.replace(/\/v1$/, '')

// Otras configuraciones
export const APP_NAME = 'Tienda Virtual'
export const APP_VERSION = '1.0.0'

/**
 * Verifica si la API está disponible
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/products?limit=1`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    return response.ok
  } catch (error) {
    console.error('❌ API no disponible:', error)
    return false
  }
}
