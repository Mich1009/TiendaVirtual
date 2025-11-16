/**
 * Context de Configuración de la Aplicación
 * 
 * Maneja la configuración global de la app:
 * - Nombre de la tienda
 * - Logo de la tienda
 * - Fuente personalizada
 * 
 * Solo el ADMIN puede modificar estas configuraciones
 */

import { createContext, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

type AppConfig = {
  storeName: string
  storeLogo: string | null
  fontFamily: string
}

type AppConfigContextType = {
  config: AppConfig
  updateStoreName: (name: string) => Promise<void>
  updateStoreLogo: (logo: string | null) => Promise<void>
  updateFontFamily: (font: string) => Promise<void>
  resetConfig: () => Promise<void>
}

const defaultConfig: AppConfig = {
  storeName: 'Tienda',
  storeLogo: null,
  fontFamily: 'System'
}

const AppConfigContext = createContext<AppConfigContextType | null>(null)

export function AppConfigProvider({ children }: { children: any }) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig)

  // Cargar configuración al iniciar
  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    try {
      const saved = await AsyncStorage.getItem('app.config')
      if (saved) {
        setConfig(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error cargando configuración:', error)
    }
  }

  async function saveConfig(newConfig: AppConfig) {
    try {
      await AsyncStorage.setItem('app.config', JSON.stringify(newConfig))
      setConfig(newConfig)
      console.log('✅ Configuración guardada:', newConfig)
    } catch (error) {
      console.error('Error guardando configuración:', error)
      throw error
    }
  }

  async function updateStoreName(name: string) {
    await saveConfig({ ...config, storeName: name })
  }

  async function updateStoreLogo(logo: string | null) {
    await saveConfig({ ...config, storeLogo: logo })
  }

  async function updateFontFamily(font: string) {
    await saveConfig({ ...config, fontFamily: font })
  }

  async function resetConfig() {
    await saveConfig(defaultConfig)
  }

  return (
    <AppConfigContext.Provider value={{
      config,
      updateStoreName,
      updateStoreLogo,
      updateFontFamily,
      resetConfig
    }}>
      {children}
    </AppConfigContext.Provider>
  )
}

export function useAppConfig() {
  const context = useContext(AppConfigContext)
  if (!context) {
    throw new Error('useAppConfig debe usarse dentro de AppConfigProvider')
  }
  return context
}
