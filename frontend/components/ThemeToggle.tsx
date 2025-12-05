/**
 * Componente: ThemeToggle
 * 
 * Botón para cambiar entre tema claro y oscuro
 * Se puede usar en cualquier parte de la app
 */

import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from '@/context/ThemeContext'
import { IconSymbol } from '@/components/ui/icon-symbol'

/**
 * Props del componente
 */
type ThemeToggleProps = {
  size?: number
  color?: string
}

/**
 * Componente ThemeToggle
 * 
 * Muestra un botón que alterna entre tema claro y oscuro
 * 
 * Ejemplo:
 * <ThemeToggle size={24} />
 */
export function ThemeToggle({ size = 24, color }: ThemeToggleProps) {
  const { theme, toggleTheme, colors } = useTheme()

  return (
    <Pressable
      onPress={toggleTheme}
      style={styles.button}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <IconSymbol
        name={theme === 'light' ? 'moon.fill' : 'sun.max.fill'}
        size={size}
        color={color || colors.tint}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
})
