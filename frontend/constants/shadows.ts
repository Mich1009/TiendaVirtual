/**
 * Estilos de sombras compatibles con React Native y Web
 */

import { Platform } from 'react-native'
import { FalabellaColors } from './theme'

export const Shadows = {
  small: Platform.select({
    ios: {
      shadowColor: FalabellaColors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
    web: {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
    },
    default: {
      shadowColor: FalabellaColors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
  }),

  medium: Platform.select({
    ios: {
      shadowColor: FalabellaColors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 3,
    },
    web: {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    default: {
      shadowColor: FalabellaColors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  }),
}