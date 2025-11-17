/**
 * Alert personalizado para compatibilidad web
 * Exporta el Alert personalizado sin modificar el global
 */

import { Platform } from 'react-native'
import { Alert as RNAlert } from 'react-native'
import { Alert as CustomAlert } from '@/components/ui/alert'

// Usar Alert personalizado en web, Alert nativo en móvil
const Alert = Platform.OS === 'web' ? CustomAlert : RNAlert

export default Alert