/**
 * Pantalla de Configuración del Admin
 * 
 * Solo accesible para usuarios con rol ADMIN
 * Permite configurar:
 * - Personalización de la tienda (logo, nombre, fuente)
 */

import { useState, useEffect } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useAppConfig } from '@/context/AppConfigContext'
import { getUser } from '@/lib/auth'
import { FalabellaColors } from '@/constants/theme'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { useRouter } from 'expo-router'

// Fuentes disponibles para seleccionar
const AVAILABLE_FONTS = [
  { label: 'Sistema (Default)', value: 'System' },
  { label: 'Sans Serif', value: 'sans-serif' },
  { label: 'Serif', value: 'serif' },
  { label: 'Monospace', value: 'monospace' },
]

export default function AdminSettingsScreen() {
  const router = useRouter()
  const { config, updateStoreName, updateStoreLogo, updateFontFamily } = useAppConfig()
  
  // Estados
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Estados de personalización (valores temporales antes de guardar)
  const [tempStoreName, setTempStoreName] = useState(config.storeName)
  const [tempSelectedFont, setTempSelectedFont] = useState(config.fontFamily)
  const [tempLogoUri, setTempLogoUri] = useState<string | null>(config.storeLogo)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Mensajes de éxito/error
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    checkAdminAccess()
  }, [])

  // Detectar cambios en la personalización
  useEffect(() => {
    const changed = 
      tempStoreName !== config.storeName ||
      tempSelectedFont !== config.fontFamily ||
      tempLogoUri !== config.storeLogo
    setHasChanges(changed)
  }, [tempStoreName, tempSelectedFont, tempLogoUri, config])

  async function checkAdminAccess() {
    try {
      const user = await getUser()
      if (!user || user.role !== 'ADMIN') {
        Alert.alert('Acceso denegado', 'Solo los administradores pueden acceder a esta sección')
        router.back()
        return
      }
      setIsAdmin(true)
    } catch (error) {
      console.error('Error verificando acceso:', error)
      router.back()
    } finally {
      setLoading(false)
    }
  }

  async function handlePickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri
        setTempLogoUri(uri)
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error)
      Alert.alert('Error', 'No se pudo seleccionar la imagen')
    }
  }

  function handleRemoveLogo() {
    Alert.alert(
      'Eliminar logo',
      '¿Estás seguro de que deseas eliminar el logo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: () => setTempLogoUri(null)
        }
      ]
    )
  }

  async function handleSaveChanges() {
    // Validaciones
    if (!tempStoreName.trim()) {
      Alert.alert('Error', 'El nombre de la tienda no puede estar vacío')
      return
    }

    try {
      setSaving(true)
      
      // Guardar todos los cambios
      await updateStoreName(tempStoreName.trim())
      await updateStoreLogo(tempLogoUri)
      await updateFontFamily(tempSelectedFont)
      
      setHasChanges(false)
      
      // Mostrar mensaje y volver al perfil
      Alert.alert(
        'Cambios guardados',
        'Los cambios se han aplicado correctamente. Verás los cambios reflejados en el catálogo.',
        [
          { 
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      )
      
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  function handleCancelChanges() {
    Alert.alert(
      'Cancelar cambios',
      '¿Estás seguro de que deseas descartar los cambios?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, descartar',
          style: 'destructive',
          onPress: () => {
            setTempStoreName(config.storeName)
            setTempSelectedFont(config.fontFamily)
            setTempLogoUri(config.storeLogo)
            setHasChanges(false)
          }
        }
      ]
    )
  }

  function showSuccess(message: string) {
    setSuccessMsg(message)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={FalabellaColors.primary} />
          <Text style={styles.loadingText}>Verificando acceso...</Text>
        </View>
      </View>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Configuración</Text>
        <Text style={styles.subtitle}>Panel de administración</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Mensaje de éxito global */}
        {!!successMsg && (
          <View style={styles.successMessage}>
            <IconSymbol name="checkmark.circle.fill" size={20} color={FalabellaColors.success} />
            <Text style={styles.successText}>{successMsg}</Text>
          </View>
        )}

        {/* Sección: Personalización */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="paintbrush.fill" size={24} color={FalabellaColors.primary} />
            <Text style={styles.sectionTitle}>Personalización</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Personaliza la apariencia de tu tienda
          </Text>
          
          {/* Vista previa */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Vista previa:</Text>
            <View style={styles.previewContent}>
              {tempLogoUri ? (
                <Image source={{ uri: tempLogoUri }} style={styles.logoPreview} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <IconSymbol name="photo" size={32} color={FalabellaColors.textMuted} />
                </View>
              )}
              <Text style={styles.storeNamePreview}>{tempStoreName || 'Tienda'}</Text>
            </View>
          </View>

          {/* Logo */}
          <Text style={styles.label}>Logo de la tienda</Text>
          <View style={styles.logoActions}>
            <Pressable onPress={handlePickImage} style={styles.logoButton}>
              <IconSymbol name="photo.badge.plus" size={20} color={FalabellaColors.white} />
              <Text style={styles.logoButtonText}>
                {tempLogoUri ? 'Cambiar logo' : 'Subir logo'}
              </Text>
            </Pressable>
            {tempLogoUri && (
              <Pressable onPress={handleRemoveLogo} style={styles.logoButtonDanger}>
                <IconSymbol name="trash" size={20} color={FalabellaColors.white} />
              </Pressable>
            )}
          </View>

          {/* Nombre de la tienda */}
          <Text style={styles.label}>Nombre de la tienda</Text>
          <TextInput
            value={tempStoreName}
            onChangeText={setTempStoreName}
            placeholder="Ej: Mi Tienda Online"
            placeholderTextColor={FalabellaColors.textMuted}
            style={styles.input}
          />

          {/* Tipo de letra */}
          <Text style={styles.label}>Tipo de letra</Text>
          <View style={styles.fontOptions}>
            {AVAILABLE_FONTS.map((font) => (
              <Pressable
                key={font.value}
                onPress={() => setTempSelectedFont(font.value)}
                style={[
                  styles.fontOption,
                  tempSelectedFont === font.value && styles.fontOptionSelected
                ]}
              >
                <View style={styles.fontOptionContent}>
                  <Text style={[
                    styles.fontOptionLabel,
                    tempSelectedFont === font.value && styles.fontOptionLabelSelected,
                    { fontFamily: font.value !== 'System' ? font.value : undefined }
                  ]}>
                    {font.label}
                  </Text>
                  {tempSelectedFont === font.value && (
                    <IconSymbol name="checkmark.circle.fill" size={20} color={FalabellaColors.primary} />
                  )}
                </View>
              </Pressable>
            ))}
          </View>

          {/* Botones de acción */}
          {hasChanges && (
            <View style={styles.actionButtons}>
              <Pressable 
                onPress={handleCancelChanges} 
                style={styles.cancelButton}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable 
                onPress={handleSaveChanges} 
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                disabled={saving}
              >
                <IconSymbol name="checkmark.circle.fill" size={20} color={FalabellaColors.white} />
                <Text style={styles.saveButtonText}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FalabellaColors.backgroundGray,
  },
  header: {
    backgroundColor: FalabellaColors.white,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: FalabellaColors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: FalabellaColors.text,
  },
  subtitle: {
    fontSize: 14,
    color: FalabellaColors.textMuted,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: FalabellaColors.textLight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  successText: {
    color: FalabellaColors.success,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  errorText: {
    color: FalabellaColors.error,
    fontSize: 14,
    flex: 1,
  },
  section: {
    backgroundColor: FalabellaColors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: FalabellaColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: FalabellaColors.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: FalabellaColors.textMuted,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: FalabellaColors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  previewContainer: {
    backgroundColor: FalabellaColors.backgroundGray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: FalabellaColors.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoPreview: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: FalabellaColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: FalabellaColors.border,
  },
  storeNamePreview: {
    fontSize: 20,
    fontWeight: '700',
    color: FalabellaColors.text,
  },
  logoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  logoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FalabellaColors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  logoButtonText: {
    color: FalabellaColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  logoButtonDanger: {
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: FalabellaColors.error,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: FalabellaColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 15,
    color: FalabellaColors.text,
    backgroundColor: FalabellaColors.white,
  },
  fontOptions: {
    gap: 8,
  },
  fontOption: {
    borderWidth: 2,
    borderColor: FalabellaColors.border,
    borderRadius: 8,
    padding: 12,
  },
  fontOptionSelected: {
    borderColor: FalabellaColors.primary,
    backgroundColor: '#E3F2FD',
  },
  fontOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fontOptionLabel: {
    fontSize: 15,
    color: FalabellaColors.text,
  },
  fontOptionLabelSelected: {
    fontWeight: '600',
    color: FalabellaColors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: FalabellaColors.border,
    backgroundColor: FalabellaColors.white,
  },
  cancelButtonText: {
    color: FalabellaColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FalabellaColors.primary,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: FalabellaColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  passwordButton: {
    marginTop: 16,
    backgroundColor: FalabellaColors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
})
