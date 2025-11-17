/**
 * Configuración de la aplicación
 */

import Constants from 'expo-constants'
import { Platform } from 'react-native'

/**
 * Obtiene las URLs del API desde app.json
 */
const extra = (Constants?.expoConfig?.extra as any) || {}
const API_URL_WEB = extra.API_URL || 'http://localhost:4000/v1'
const API_URL_MOBILE = extra.API_URL_MOBILE || 'http://localhost:4000/v1'

// Seleccionar URL según la plataforma
const API_URL = Platform.select({
  web: API_URL_WEB,           // Web usa localhost
  android: API_URL_MOBILE,    // Android usa IP de la red
  ios: API_URL_MOBILE,        // iOS usa IP de la red
  default: API_URL_WEB        // Fallback a web
}) as string

// Log para debugging
console.log('🌐 Plataforma:', Platform.OS)
console.log('🔗 API URL:', API_URL)

// Remover /v1 del final para obtener la URL base sin versión
export const API_BASE_URL = API_URL.replace(/\/v1$/, '')

// URL final que se usará para todas las peticiones
export { API_URL }

// Otras configuraciones
export const APP_NAME = 'Tienda Virtual'
export const APP_VERSION = '1.0.0'
