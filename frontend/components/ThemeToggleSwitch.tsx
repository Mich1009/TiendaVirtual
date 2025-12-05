/**
 * Componente: ThemeToggleSwitch
 * 
 * Botón ON/OFF para cambiar entre tema claro y oscuro
 */

import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/context/ThemeContext'
import { FalabellaColors } from '@/constants/theme'

export function ThemeToggleSwitch() {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <Pressable onPress={toggleTheme} style={styles.container}>
      <View style={[styles.switch, isLight ? styles.switchLight : styles.switchDark]}>
        <Text style={styles.label}>{isLight ? 'ON' : 'OFF'}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  switch: {
    width: 60,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  switchLight: {
    backgroundColor: '#E8F5E9',
    borderColor: FalabellaColors.primary,
  },
  switchDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#666666',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: FalabellaColors.primary,
  },
})
