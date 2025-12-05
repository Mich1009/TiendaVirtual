/**
 * Pantalla de Configuración del Admin
 * 
 * Solo accesible para usuarios con rol ADMIN
 * Permite configurar:
 * - Personalización de la tienda (logo, nombre, fuente)
 */

import { useState, useEffect, useCallback } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useAppConfig } from '@/context/AppConfigContext'
import { getUser } from '@/lib/auth'
import { FalabellaColors } from '@/constants/theme'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { useTheme } from '@/context/ThemeContext'
import { useRouter } from 'expo-router'

// Fuentes disponibles para seleccionar
const AVAILABLE_FONTS = [
  { label: 'Sistema (Default)', value: 'System' },
  { label: 'Sans Serif', value: 'sans-serif' },
  { label: 'Serif', value: 'serif' },
  { label: 'Monospace', value: 'monospace' },
]

export default function AdminConfiguracionScreen() {
  const router = useRouter()
  const { config, updateAllSettings } = useAppConfig()
  
  // Estados
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Estados de personalización (valores temporales antes de guardar)
  const [tempStoreName, setTempStoreName] = useState(config.storeName)
  const [tempSelectedFont, setTempSelectedFont] = useState(config.fontFamily)
  const [tempLogoUri, setTempLogoUri] = useState<string | null>(config.storeLogo)
  const [tempDisplayMode, setTempDisplayMode] = useState<'logo' | 'text' | 'both'>((config as any).displayMode || 'both')
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Mensajes de éxito/error
  const [successMsg, setSuccessMsg] = useState('')

  // Sincronizar valores temporales con el contexto cuando cambia
  useEffect(() => {
    setTempStoreName(config.storeName)
    setTempSelectedFont(config.fontFamily)
    setTempLogoUri(config.storeLogo)
    setTempDisplayMode((config as any).displayMode || 'both')
  }, [config])

  // Detectar cambios en la personalización
  useEffect(() => {
    const changed = 
      tempStoreName !== config.storeName ||
      tempSelectedFont !== config.fontFamily ||
      tempLogoUri !== config.storeLogo ||
      tempDisplayMode !== ((config as any).displayMode || 'both')
    setHasChanges(changed)
  }, [tempStoreName, tempSelectedFont, tempLogoUri, tempDisplayMode, config])

  const checkAdminAccess = useCallback(async () => {
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
  }, [router])

  useEffect(() => {
    checkAdminAccess()
  }, [checkAdminAccess])

  async function handlePickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Reducir calidad para comprimir más
        base64: false,
      })

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0]
        console.log('📷 Imagen seleccionada:', {
          tamaño: asset.fileSize ? `${Math.round(asset.fileSize / 1024)}KB` : 'desconocido',
          dimensiones: `${asset.width}x${asset.height}`
        })
        
        // Si la imagen es muy grande, mostrar advertencia pero permitir continuar
        if (asset.fileSize && asset.fileSize > 1024 * 1024) { // > 1MB
          Alert.alert(
            'Imagen grande',
            `La imagen es de ${Math.round(asset.fileSize / 1024 / 1024)}MB. Se recomienda usar imágenes más pequeñas para mejor rendimiento.`,
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Usar de todos modos', onPress: () => setTempLogoUri(asset.uri) }
            ]
          )
        } else {
          setTempLogoUri(asset.uri)
        }
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
    // Validaciones básicas - solo validar si hay contenido para mostrar
    if ((tempDisplayMode === 'text' || tempDisplayMode === 'both') && !tempStoreName.trim()) {
      Alert.alert('Error', 'El nombre de la tienda no puede estar vacío cuando se muestra texto')
      return
    }
    
    // Advertencia si selecciona solo logo pero no hay logo (pero permitir guardar)
    if (tempDisplayMode === 'logo' && !tempLogoUri) {
      Alert.alert(
        'Advertencia',
        'Has seleccionado mostrar solo el logo, pero no has subido ningún logo. ¿Deseas continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => saveSettings() }
        ]
      )
      return
    }
    
    // Si pasa todas las validaciones, guardar directamente
    saveSettings()
  }

  async function saveSettings() {

    try {
      setSaving(true)
      
      // Guardar todos los cambios de una vez
      console.log('💾 Guardando cambios:', {
        nombre: tempStoreName.trim(),
        logo: tempLogoUri,
        fuente: tempSelectedFont,
        modo: tempDisplayMode
      })
      
      await updateAllSettings({
        storeName: tempStoreName.trim(),
        storeLogo: tempLogoUri,
        fontFamily: tempSelectedFont,
        displayMode: tempDisplayMode
      } as any)
      
      console.log('✅ Cambios guardados exitosamente en el backend')
      
      // Mostrar mensaje de éxito
      showSuccess('✅ Cambios guardados correctamente')
      
      // Los valores temporales se sincronizarán automáticamente con el useEffect
      
    } catch (error) {
      console.error('Error guardando cambios:', error)
      Alert.alert('Error', 'No se pudieron guardar los cambios. Verifica tu conexión.')
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
            setTempDisplayMode((config as any).displayMode || 'both')
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
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Configuración</Text>
            <Text style={styles.subtitle}>Panel de administración</Text>
          </View>
          <ThemeToggleButtonAdmin />
        </View>
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
          
          {/* Vista previa del header */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>📱 Vista previa del inicio</Text>
            <Text style={styles.previewSubLabel}>Así se verá en la pantalla principal</Text>
            
            {/* Simulación del header real */}
            <View style={styles.headerPreview}>
              <View style={styles.headerPreviewContent}>
                {/* Mostrar logo solo si el modo lo permite */}
                {(tempDisplayMode === 'logo' || tempDisplayMode === 'both') && (
                  tempLogoUri ? (
                    <Image source={{ uri: tempLogoUri }} style={styles.logoPreviewLarge} />
                  ) : (
                    <View style={styles.logoPlaceholderLarge}>
                      <Text style={styles.logoPlaceholderText}>🏪</Text>
                      {tempDisplayMode === 'logo' && (
                        <Text style={styles.logoPlaceholderSubtext}>Sin logo</Text>
                      )}
                    </View>
                  )
                )}
                
                {/* Mostrar texto solo si el modo lo permite */}
                {(tempDisplayMode === 'text' || tempDisplayMode === 'both') && (
                  <Text 
                    style={[
                      styles.storeNamePreviewLarge,
                      { 
                        fontFamily: tempSelectedFont !== 'System' ? tempSelectedFont : undefined,
                        marginLeft: (tempDisplayMode === 'both' && tempLogoUri) ? 12 : 0
                      }
                    ]}
                    numberOfLines={1}
                  >
                    {tempStoreName || 'Tienda'}
                  </Text>
                )}
                
                {/* Mensaje si no hay contenido para mostrar */}
                {tempDisplayMode === 'logo' && !tempLogoUri && (
                  <Text style={styles.noContentMessage}>
                    Sube un logo para verlo aquí
                  </Text>
                )}
              </View>
              
              {/* Elementos decorativos para simular el header real */}
              <View style={styles.headerPreviewIcons}>
                <View style={styles.iconPlaceholder}>
                  <Text>🔍</Text>
                </View>
                <View style={styles.iconPlaceholder}>
                  <Text>🛒</Text>
                </View>
              </View>
            </View>
            
            {/* Indicador de cambios */}
            {hasChanges && (
              <View style={styles.previewBadge}>
                <Text style={styles.previewBadgeText}>⚡ Cambios pendientes de guardar</Text>
              </View>
            )}
          </View>

          {/* Modo de visualización */}
          <Text style={styles.label}>¿Qué mostrar en el encabezado?</Text>
          <View style={styles.displayModeOptions}>
            <Pressable
              onPress={() => setTempDisplayMode('logo')}
              style={[
                styles.displayModeOption,
                tempDisplayMode === 'logo' && styles.displayModeOptionSelected
              ]}
            >
              <View style={styles.displayModeContent}>
                <Text style={styles.displayModeEmoji}>🖼️</Text>
                <Text style={[
                  styles.displayModeLabel,
                  tempDisplayMode === 'logo' && styles.displayModeLabelSelected
                ]}>
                  Solo logo
                </Text>
                <Text style={styles.displayModeDescription}>
                  Mostrar únicamente el logo
                </Text>
              </View>
              {tempDisplayMode === 'logo' && (
                <IconSymbol name="checkmark.circle.fill" size={20} color={FalabellaColors.primary} />
              )}
            </Pressable>

            <Pressable
              onPress={() => setTempDisplayMode('text')}
              style={[
                styles.displayModeOption,
                tempDisplayMode === 'text' && styles.displayModeOptionSelected
              ]}
            >
              <View style={styles.displayModeContent}>
                <Text style={styles.displayModeEmoji}>📝</Text>
                <Text style={[
                  styles.displayModeLabel,
                  tempDisplayMode === 'text' && styles.displayModeLabelSelected
                ]}>
                  Solo texto
                </Text>
                <Text style={styles.displayModeDescription}>
                  Mostrar únicamente el nombre
                </Text>
              </View>
              {tempDisplayMode === 'text' && (
                <IconSymbol name="checkmark.circle.fill" size={20} color={FalabellaColors.primary} />
              )}
            </Pressable>

            <Pressable
              onPress={() => setTempDisplayMode('both')}
              style={[
                styles.displayModeOption,
                tempDisplayMode === 'both' && styles.displayModeOptionSelected
              ]}
            >
              <View style={styles.displayModeContent}>
                <Text style={styles.displayModeEmoji}>🖼️📝</Text>
                <Text style={[
                  styles.displayModeLabel,
                  tempDisplayMode === 'both' && styles.displayModeLabelSelected
                ]}>
                  Logo y texto
                </Text>
                <Text style={styles.displayModeDescription}>
                  Mostrar logo y nombre juntos
                </Text>
              </View>
              {tempDisplayMode === 'both' && (
                <IconSymbol name="checkmark.circle.fill" size={20} color={FalabellaColors.primary} />
              )}
            </Pressable>
          </View>

          {/* Logo - Solo mostrar si el modo incluye logo */}
          {(tempDisplayMode === 'logo' || tempDisplayMode === 'both') && (
            <>
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
                    <Text style={styles.logoIcon}>🗑️</Text>
                  </Pressable>
                )}
              </View>
            </>
          )}

          {/* Nombre de la tienda - Solo mostrar si el modo incluye texto */}
          {(tempDisplayMode === 'text' || tempDisplayMode === 'both') && (
            <>
              <Text style={styles.label}>Nombre de la tienda</Text>
              <TextInput
                value={tempStoreName}
                onChangeText={setTempStoreName}
                placeholder="Ej: Mi Tienda Online"
                placeholderTextColor={FalabellaColors.textMuted}
                style={styles.input}
              />
            </>
          )}

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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeButtonAdmin: {
    padding: 8,
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
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: FalabellaColors.border,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: FalabellaColors.text,
    marginBottom: 4,
  },
  previewSubLabel: {
    fontSize: 12,
    color: FalabellaColors.textMuted,
    marginBottom: 16,
  },
  headerPreview: {
    backgroundColor: FalabellaColors.white,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: FalabellaColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoPreviewLarge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  logoPlaceholderLarge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: FalabellaColors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: FalabellaColors.border,
  },
  logoPlaceholderText: {
    fontSize: 24,
  },
  storeNamePreviewLarge: {
    fontSize: 22,
    fontWeight: '700',
    color: FalabellaColors.text,
    flex: 1,
  },
  headerPreviewIcons: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 12,
  },
  iconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: FalabellaColors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewBadge: {
    marginTop: 12,
    backgroundColor: '#FFF3E0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  previewBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E65100',
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
  logoIcon: {
    fontSize: 20,
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
  displayModeOptions: {
    gap: 8,
    marginBottom: 8,
  },
  displayModeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: FalabellaColors.border,
    borderRadius: 8,
    padding: 12,
  },
  displayModeOptionSelected: {
    borderColor: FalabellaColors.primary,
    backgroundColor: '#E3F2FD',
  },
  displayModeContent: {
    flex: 1,
  },
  displayModeEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  displayModeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: FalabellaColors.text,
    marginBottom: 2,
  },
  displayModeLabelSelected: {
    color: FalabellaColors.primary,
  },
  displayModeDescription: {
    fontSize: 12,
    color: FalabellaColors.textMuted,
  },
  logoPlaceholderSubtext: {
    fontSize: 8,
    color: FalabellaColors.textMuted,
    marginTop: 2,
  },
  noContentMessage: {
    fontSize: 12,
    color: FalabellaColors.textMuted,
    fontStyle: 'italic',
    marginLeft: 12,
  },
})


/**
 * Componente: ThemeToggleButtonAdmin
 * 
 * Botón para cambiar entre tema claro y oscuro en admin
 */
function ThemeToggleButtonAdmin() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Pressable onPress={toggleTheme} style={styles.themeButtonAdmin}>
      <IconSymbol
        name={theme === 'light' ? 'moon.fill' : 'sun.max.fill'}
        size={24}
        color={FalabellaColors.primary}
      />
    </Pressable>
  )
}
