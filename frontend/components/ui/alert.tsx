/**
 * Componente de Alert compatible con Web y Móvil
 */

import { Platform, Alert as RNAlert } from 'react-native'

interface AlertButton {
  text: string
  onPress?: () => void
  style?: 'default' | 'cancel' | 'destructive'
}

export const Alert = {
  alert: (title: string, message?: string, buttons?: AlertButton[]) => {
    if (Platform.OS === 'web') {
      // En web, usar confirm/alert nativo del navegador
      if (buttons && buttons.length > 1) {
        // Crear mensaje completo
        const fullMessage = message ? `${title}\n\n${message}` : title
        
        // Buscar botones de acción y cancelar
        const cancelButton = buttons.find(b => b.style === 'cancel')
        const actionButton = buttons.find(b => b.style !== 'cancel') || buttons[buttons.length - 1]
        
        // Crear texto de botones para el confirm
        const confirmText = actionButton ? actionButton.text : 'OK'
        const cancelText = cancelButton ? cancelButton.text : 'Cancelar'
        
        const confirmed = window.confirm(`${fullMessage}\n\nPresiona OK para "${confirmText}" o Cancelar para "${cancelText}"`)
        
        if (confirmed && actionButton?.onPress) {
          actionButton.onPress()
        } else if (!confirmed && cancelButton?.onPress) {
          cancelButton.onPress()
        }
      } else {
        // Solo un botón o ninguno
        const fullMessage = message ? `${title}\n\n${message}` : title
        window.alert(fullMessage)
        if (buttons?.[0]?.onPress) {
          buttons[0].onPress()
        }
      }
    } else {
      // En móvil, usar Alert nativo de React Native
      RNAlert.alert(title, message, buttons)
    }
  }
}

// Exportar también como default para compatibilidad
export default Alert