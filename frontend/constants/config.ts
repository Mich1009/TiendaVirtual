/**
 * Configuración de la aplicación
 */

import Constants from 'expo-constants'
import { Platform } from 'react-native'

/**
 * Obtiene la URL base del API desde app.json (extra.API_URL)
 * Esta es la configuración principal que debes actualizar con tu IP local
 */
const API_URL_FROM_CONFIG = ((Constants?.expoConfig?.extra as any)?.API_URL as string) || ''

// Fallback solo si no hay configuración en app.json
const fallbackURL = Platform.select({ 
  android: 'http://10.0.2.2:4000/v1',  // IP especial para emulador Android
  ios: 'http://localhost:4000/v1',      // localhost para iOS
  default: 'http://localhost:4000/v1'   // fallback
}) as string

// URL base final que se usará para todas las peticiones
// Nota: Ya incluye /v1 al final
export const API_URL = API_URL_FROM_CONFIG || fallbackURL

// Remover /v1 del final para obtener la URL base sin versión
export const API_BASE_URL = API_URL.replace(/\/v1$/, '')

// Otras configuraciones
export const APP_NAME = 'Tienda Virtual'
export const APP_VERSION = '1.0.0'
