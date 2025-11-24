import { API_URL } from '@/constants/config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getToken as getSavedToken } from './auth'
import * as FileSystem from 'expo-file-system'

/**
 * Convierte una imagen local a base64
 */
async function imageToBase64(uri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    })
    
    // Detectar el tipo de imagen por la extensión
    const extension = uri.split('.').pop()?.toLowerCase()
    let mimeType = 'image/jpeg'
    
    if (extension === 'png') mimeType = 'image/png'
    else if (extension === 'gif') mimeType = 'image/gif'
    else if (extension === 'webp') mimeType = 'image/webp'
    
    return `data:${mimeType};base64,${base64}`
  } catch (error) {
    console.error('Error convirtiendo imagen a base64:', error)
    throw new Error('No se pudo procesar la imagen')
  }
}

/**
 * Sube una imagen a Cloudinary y retorna la URL
 */
export async function uploadImage(imageUri: string): Promise<string> {
  try {
    // Convertir a base64
    const base64Image = await imageToBase64(imageUri)
    
    // Obtener token (primary key 'token' via getToken()).
    // Mantenemos compatibilidad con la clave antigua 'auth.token'.
    let token = await getSavedToken()
    if (!token) {
      token = await AsyncStorage.getItem('auth.token')
    }
    if (!token) {
      console.warn('uploadImage: no se encontró token en AsyncStorage')
      throw new Error('No autenticado')
    }
    
    // Subir a Cloudinary
    const response = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ image: base64Image })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error subiendo imagen')
    }
    
    const data = await response.json()
    return data.url
  } catch (error) {
    console.error('Error en uploadImage:', error)
    throw error
  }
}

/**
 * Elimina una imagen de Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    const token = await AsyncStorage.getItem('auth.token')
    if (!token) {
      throw new Error('No autenticado')
    }
    
    const response = await fetch(`${API_URL}/upload/image/${encodeURIComponent(publicId)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Error eliminando imagen')
    }
  } catch (error) {
    console.error('Error en deleteImage:', error)
    throw error
  }
}

/**
 * Verifica si el servicio de upload está configurado
 */
export async function checkUploadStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/upload/status`)
    const data = await response.json()
    return data.configured
  } catch (error) {
    console.error('Error verificando status de upload:', error)
    return false
  }
}
