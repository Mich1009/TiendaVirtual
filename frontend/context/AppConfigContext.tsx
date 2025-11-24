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
import { API_URL } from '@/constants/config'

type AppConfig = {
  storeName: string
  storeLogo: string | null
  fontFamily: string
  displayMode: 'logo' | 'text' | 'both'
}

type AppConfigContextType = {
  config: AppConfig
  updateStoreName: (name: string) => Promise<void>
  updateStoreLogo: (logo: string | null) => Promise<void>
  updateFontFamily: (font: string) => Promise<void>
  updateAllSettings: (settings: Partial<AppConfig>) => Promise<void>
  resetConfig: () => Promise<void>
  refreshConfig: () => Promise<void>
}

const defaultConfig: AppConfig = {
  storeName: 'Tienda',
  storeLogo: null,
  fontFamily: 'System',
  displayMode: 'both'
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
      // Intentar cargar desde el backend
      const response = await fetch(`${API_URL}/settings`)
      if (response.ok) {
        const data = await response.json()
        const newConfig: AppConfig = {
          storeName: data.store_name || defaultConfig.storeName,
          storeLogo: data.store_logo || defaultConfig.storeLogo,
          fontFamily: data.font_family || defaultConfig.fontFamily,
          displayMode: data.display_mode || defaultConfig.displayMode
        }
        setConfig(newConfig)
        // Guardar en cache local
        await AsyncStorage.setItem('app.config', JSON.stringify(newConfig))
        console.log('✅ Configuración cargada desde backend:', newConfig)
        return
      }
    } catch (error) {
      console.log('⚠ No se pudo cargar desde backend, usando cache local')
    }

    // Fallback: cargar desde AsyncStorage
    try {
      const saved = await AsyncStorage.getItem('app.config')
      if (saved) {
        setConfig(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error cargando configuración:', error)
    }
  }

  async function refreshConfig() {
    await loadConfig()
  }

  async function updateStoreName(name: string) {
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_URL}/settings/store_name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ value: name })
      })

      if (!response.ok) {
        throw new Error('Error actualizando nombre')
      }

      const newConfig = { ...config, storeName: name }
      setConfig(newConfig)
      await AsyncStorage.setItem('app.config', JSON.stringify(newConfig))
      console.log('✅ Nombre actualizado:', name)
    } catch (error) {
      console.error('Error actualizando nombre:', error)
      throw error
    }
  }

  async function updateStoreLogo(logo: string | null) {
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_URL}/settings/store_logo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ value: logo })
      })

      if (!response.ok) {
        throw new Error('Error actualizando logo')
      }

      const newConfig = { ...config, storeLogo: logo }
      setConfig(newConfig)
      await AsyncStorage.setItem('app.config', JSON.stringify(newConfig))
      console.log('✅ Logo actualizado:', logo)
    } catch (error) {
      console.error('Error actualizando logo:', error)
      throw error
    }
  }

  async function updateFontFamily(font: string) {
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_URL}/settings/font_family`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ value: font })
      })

      if (!response.ok) {
        throw new Error('Error actualizando fuente')
      }

      const newConfig = { ...config, fontFamily: font }
      setConfig(newConfig)
      await AsyncStorage.setItem('app.config', JSON.stringify(newConfig))
      console.log('✅ Fuente actualizada:', font)
    } catch (error) {
      console.error('Error actualizando fuente:', error)
      throw error
    }
  }

  async function updateAllSettings(settings: Partial<AppConfig>) {
    try {
      const token = await AsyncStorage.getItem('token')
      console.log('🔑 Token disponible:', !!token)
      console.log('🌐 API URL:', API_URL)
      
      if (!token) {
        throw new Error('No hay sesión activa. Por favor, inicia sesión.')
      }
      
      // Convertir a formato del backend
      const backendSettings: any = {}
      if (settings.storeName !== undefined) backendSettings.store_name = settings.storeName
      if (settings.storeLogo !== undefined) backendSettings.store_logo = settings.storeLogo
      if (settings.fontFamily !== undefined) backendSettings.font_family = settings.fontFamily
      if (settings.displayMode !== undefined) backendSettings.display_mode = settings.displayMode

      console.log('📤 Enviando configuración:', backendSettings)

      const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(backendSettings)
      })

      console.log('📥 Respuesta del servidor:', response.status, response.statusText)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.')
        } else if (response.status === 403) {
          throw new Error('No tienes permisos para realizar esta acción. Solo los administradores pueden cambiar la configuración.')
        } else {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
        }
      }

      const newConfig = { ...config, ...settings }
      setConfig(newConfig)
      await AsyncStorage.setItem('app.config', JSON.stringify(newConfig))
      console.log('✅ Configuración actualizada:', newConfig)
    } catch (error) {
      console.error('Error actualizando configuración:', error)
      throw error
    }
  }

  async function resetConfig() {
    await updateAllSettings(defaultConfig)
  }

  return (
    <AppConfigContext.Provider value={{
      config,
      updateStoreName,
      updateStoreLogo,
      updateFontFamily,
      updateAllSettings,
      resetConfig,
      refreshConfig
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
