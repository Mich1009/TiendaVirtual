/**
 * Hook para detectar el esquema de color del sistema
 * 
 * Este hook determina si el usuario está usando tema claro u oscuro.
 * Actualmente está configurado para devolver siempre 'light' pero
 * puede ser extendido para detectar automáticamente el tema del sistema.
 */

import { ColorSchemeName } from 'react-native'

/**
 * Hook que devuelve el esquema de color actual
 * 
 * @returns 'light' | 'dark' | null
 * 
 * Implementación actual: Siempre devuelve 'light'
 * 
 * Para implementar detección automática, se podría usar:
 * - useColorScheme() de react-native
 * - Appearance.getColorScheme() para detección manual
 * - AsyncStorage para recordar preferencia del usuario
 */
export function useColorScheme(): ColorSchemeName {
  // TODO: Implementar detección automática del tema del sistema
  // const systemColorScheme = useColorScheme() // de react-native
  // return systemColorScheme
  
  // Por ahora, siempre usar tema claro
  return 'light'
}