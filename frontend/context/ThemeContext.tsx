/**
 * Context de Temas
 * 
 * Permite cambiar entre tema claro y oscuro dinámicamente
 * Los cambios se guardan en AsyncStorage y persisten entre sesiones
 */

import { createContext, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Colors } from '@/constants/theme'

/**
 * Tipo de tema disponible
 */
export type ThemeType = 'light' | 'dark'

/**
 * Tipo del contexto de tema
 */
type ThemeContextType = {
  theme: ThemeType
  colors: typeof Colors.light
  toggleTheme: () => Promise<void>
  setTheme: (theme: ThemeType) => Promise<void>
}

/**
 * Crear el contexto
 */
const ThemeContext = createContext<ThemeContextType | null>(null)

/**
 * Proveedor del contexto de tema
 * 
 * Debe envolver toda la aplicación
 * 
 * Ejemplo:
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({ children }: { children: any }) {
  // Estado del tema actual
  const [theme, setThemeState] = useState<ThemeType>('light')
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Cargar tema guardado al iniciar
   */
  useEffect(() => {
    ;(async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('app.theme')
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setThemeState(savedTheme)
        }
      } catch (error) {
        console.error('Error cargando tema:', error)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  /**
   * Cambiar entre tema claro y oscuro
   */
  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light'
      setThemeState(newTheme)
      await AsyncStorage.setItem('app.theme', newTheme)
      console.log(`✅ Tema cambiado a: ${newTheme}`)
    } catch (error) {
      console.error('Error guardando tema:', error)
    }
  }

  /**
   * Establecer un tema específico
   */
  const setTheme = async (newTheme: ThemeType) => {
    try {
      setThemeState(newTheme)
      await AsyncStorage.setItem('app.theme', newTheme)
      console.log(`✅ Tema establecido a: ${newTheme}`)
    } catch (error) {
      console.error('Error guardando tema:', error)
    }
  }

  // Obtener colores del tema actual
  const colors = theme === 'light' ? Colors.light : Colors.dark

  return (
    <ThemeContext.Provider value={{ theme: isLoading ? 'light' : theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook para usar el contexto de tema
 * 
 * Ejemplo:
 * const { theme, colors, toggleTheme } = useTheme()
 * 
 * @returns Contexto del tema
 * @throws Error si se usa fuera del ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider')
  }
  return context
}
