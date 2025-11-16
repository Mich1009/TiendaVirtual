/**
 * Módulo de Autenticación
 * 
 * Maneja el almacenamiento y decodificación de tokens JWT
 * Los tokens se guardan en AsyncStorage de forma persistente
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { decode as b64decode } from 'base-64'

/**
 * Obtiene el token JWT almacenado
 * @returns Token JWT o null si no existe
 */
export async function getToken(): Promise<string | null> {
  try {
    return (await AsyncStorage.getItem('token')) || null
  } catch (error) {
    console.error('Error obteniendo token:', error)
    return null
  }
}

/**
 * Guarda el token JWT en AsyncStorage
 * @param token - Token JWT a guardar
 */
export async function setToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem('token', token)
    console.log('✅ Token guardado correctamente')
  } catch (error) {
    console.error('Error guardando token:', error)
    throw error
  }
}

/**
 * Elimina el token JWT de AsyncStorage
 * Se usa al cerrar sesión
 */
export async function clearToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem('token')
    console.log('✅ Token eliminado correctamente')
  } catch (error) {
    console.error('Error eliminando token:', error)
    throw error
  }
}

/**
 * Decodifica un token JWT y extrae el payload
 * @param token - Token JWT a decodificar
 * @returns Payload del token o null si es inválido
 */
export function decodeJwt(token: string): any {
  try {
    // El token JWT tiene 3 partes separadas por puntos: header.payload.signature
    const [, payload] = token.split('.')
    
    // Decodificar el payload de base64
    const json = JSON.parse(
      b64decode(payload.replace(/-/g, '+').replace(/_/g, '/'))
    )
    
    return json
  } catch (error) {
    console.error('Error decodificando JWT:', error)
    return null
  }
}

/**
 * Obtiene la información del usuario desde el token JWT
 * @returns Objeto con id, role, email y exp del usuario, o null si no hay token
 */
export async function getUser(): Promise<{
  id: number
  role: 'CUSTOMER' | 'ADMIN'
  email: string
  exp: number
} | null> {
  try {
    const token = await getToken()
    
    if (!token) {
      return null
    }
    
    const payload = decodeJwt(token)
    
    if (!payload) {
      return null
    }
    
    // Verificar si el token ha expirado
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      console.warn('⚠️  Token expirado')
      await clearToken()
      return null
    }
    
    const { id, role, email, exp } = payload
    return { id, role, email, exp }
  } catch (error) {
    console.error('Error obteniendo usuario:', error)
    return null
  }
}