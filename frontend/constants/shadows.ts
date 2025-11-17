/**
 * Estilos de sombras multiplataforma
 * 
 * Define sombras consistentes que funcionan en iOS, Android y Web
 * Cada plataforma usa su método nativo para renderizar sombras:
 * - iOS: shadowColor, shadowOffset, shadowOpacity, shadowRadius
 * - Android: elevation
 * - Web: boxShadow CSS
 */

import { Platform } from 'react-native'
import { FalabellaColors } from './theme'

export const Shadows = {
  /**
   * Sombra pequeña y sutil
   * Ideal para: botones, campos de entrada, elementos interactivos pequeños
   */
  small: Platform.select({
    // iOS: Usa propiedades de sombra nativas
    ios: {
      shadowColor: FalabellaColors.black,        // Color de la sombra
      shadowOffset: { width: 0, height: 2 },     // Desplazamiento: 2px hacia abajo
      shadowOpacity: 0.08,                       // Opacidad muy sutil (8%)
      shadowRadius: 4,                           // Radio de difuminado
    },
    
    // Android: Usa elevation para sombras automáticas
    android: {
      elevation: 2,  // Elevación baja para sombra sutil
    },
    
    // Web: Usa CSS box-shadow
    web: {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',  // Sombra CSS equivalente
    },
    
    // Fallback: Combina todas las propiedades para compatibilidad
    default: {
      shadowColor: FalabellaColors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
  }),

  /**
   * Sombra mediana más visible
   * Ideal para: tarjetas, modales, elementos flotantes importantes
   */
  medium: Platform.select({
    // iOS: Sombra más pronunciada
    ios: {
      shadowColor: FalabellaColors.black,        // Color de la sombra
      shadowOffset: { width: 0, height: 2 },     // Mismo desplazamiento
      shadowOpacity: 0.1,                        // Opacidad más visible (10%)
      shadowRadius: 4,                           // Mismo radio de difuminado
    },
    
    // Android: Mayor elevación para sombra más visible
    android: {
      elevation: 3,  // Elevación media
    },
    
    // Web: Sombra CSS más pronunciada
    web: {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',  // Mayor opacidad en CSS
    },
    
    // Fallback: Propiedades combinadas
    default: {
      shadowColor: FalabellaColors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  }),
}