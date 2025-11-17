/**
 * Configuración global para reemplazar Alert en toda la aplicación
 * Este archivo debe importarse en _layout.tsx para que funcione globalmente
 */

import { Platform } from 'react-native'
import { Alert as CustomAlert } from '@/components/ui/alert'

// Solo en web, reemplazar el Alert global
if (Platform.OS === 'web') {
  // Reemplazar Alert en el objeto global
  if (typeof window !== 'undefined') {
    (window as any).Alert = CustomAlert
  }
  
  // También reemplazar en React Native
  const RN = require('react-native')
  if (RN && RN.Alert) {
    RN.Alert = CustomAlert
  }
}

export default CustomAlert