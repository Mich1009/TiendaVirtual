/**
 * Pantalla de Perfil
 * 
 * Funcionalidad:
 * - Verifica si el usuario está autenticado
 * - Si NO está autenticado, muestra botón para ir al login
 * - Si está autenticado, muestra:
 *   - Información del usuario (nombre, email, rol)
 *   - Dirección de envío
 *   - Método de pago
 *   - Cambio de contraseña
 *   - Botón de cerrar sesión
 * 
 * Roles soportados:
 * - CUSTOMER: Cliente normal
 * - ADMIN: Administrador (puede tener opciones adicionales)
 */

import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { changePassword } from '@/lib/api'
import { getToken, getUser, clearToken } from '@/lib/auth'
import { FalabellaColors } from '@/constants/theme'
import { IconSymbol } from '@/components/ui/icon-symbol'

export default function PerfilScreen() {
  const router = useRouter()
  
  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Estados de formularios
  const [shipping, setShipping] = useState({
    fullName: '', phone: '', address1: '', address2: '', city: '', state: '', zip: '', country: ''
  })
  const [payment, setPayment] = useState({ cardholder: '', cardNumber: '', expiry: '', brand: '' })
  const [msg, setMsg] = useState('')
  const [pwd, setPwd] = useState({ old: '', next: '', confirm: '' })
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdErr, setPwdErr] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)
  const [showOldPwd, setShowOldPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)

  /**
   * Verifica si el usuario está autenticado al cargar la pantalla
   * Si está autenticado, carga sus datos
   * Si no está autenticado, muestra la pantalla de login
   */
  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      setLoading(true)
      const token = await getToken()
      
      if (!token) {
        // No hay token, usuario no autenticado
        setIsAuthenticated(false)
        setUser(null)
        return
      }

      // Decodificar el token para obtener información del usuario
      const userData = await getUser()
      
      if (!userData) {
        // Token inválido o expirado
        setIsAuthenticated(false)
        setUser(null)
        await clearToken()
        return
      }

      // Usuario autenticado correctamente
      setIsAuthenticated(true)
      setUser(userData)

      // Cargar datos guardados (dirección y pago)
      const s = await AsyncStorage.getItem('settings.shipping')
      if (s) setShipping(JSON.parse(s))
      const p = await AsyncStorage.getItem('settings.payment')
      if (p) setPayment(JSON.parse(p))
      
    } catch (error) {
      console.error('Error verificando autenticación:', error)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function saveShipping() {
    await AsyncStorage.setItem('settings.shipping', JSON.stringify(shipping))
    setMsg('Dirección de envío guardada')
    setTimeout(() => setMsg(''), 2000)
  }

  async function savePayment() {
    const data: any = { ...payment }
    const digits = (data.cardNumber || '').replace(/\D/g, '')
    data.brand = data.brand || (digits.startsWith('4') ? 'Visa' : digits.startsWith('5') ? 'Mastercard' : '')
    if (digits.length >= 4) data.last4 = digits.slice(-4)
    delete data.cardNumber
    await AsyncStorage.setItem('settings.payment', JSON.stringify(data))
    setMsg('Método de pago guardado')
    setTimeout(() => setMsg(''), 2000)
  }

  /**
   * Cambia la contraseña del usuario
   * Requiere contraseña actual y nueva contraseña
   */
  async function changePwd() {
    setPwdErr('')
    setPwdMsg('')
    
    // Validaciones
    if (!pwd.old || !pwd.next || !pwd.confirm) {
      setPwdErr('Completa todos los campos')
      return
    }
    if (pwd.next.length < 6) {
      setPwdErr('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }
    if (pwd.next !== pwd.confirm) {
      setPwdErr('La confirmación no coincide')
      return
    }
    
    try {
      setPwdLoading(true)
      const token = await getToken()
      if (!token) {
        setPwdErr('Sesión expirada. Inicia sesión nuevamente')
        return
      }
      
      await changePassword(token, pwd.old, pwd.next)
      setPwdMsg('Contraseña actualizada correctamente')
      setPwd({ old: '', next: '', confirm: '' })
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setPwdMsg(''), 3000)
    } catch (e: any) {
      setPwdErr(e.message || 'Error al cambiar la contraseña')
    } finally {
      setPwdLoading(false)
    }
  }

  /**
   * Cierra la sesión del usuario
   * Limpia el token y redirige al login
   */
  async function handleLogout() {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await clearToken()
            setIsAuthenticated(false)
            setUser(null)
            router.replace('/login')
          }
        }
      ]
    )
  }

  // Pantalla de carga mientras verifica autenticación
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mi Perfil</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={FalabellaColors.primary} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </View>
    )
  }

  // Pantalla cuando NO está autenticado
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mi Perfil</Text>
        </View>
        <View style={styles.notAuthContainer}>
          <IconSymbol name="person.circle" size={80} color={FalabellaColors.textMuted} />
          <Text style={styles.notAuthTitle}>Inicia sesión</Text>
          <Text style={styles.notAuthSubtitle}>
            Inicia sesión para acceder a tu perfil, ver tus pedidos y gestionar tu cuenta
          </Text>
          <Pressable 
            onPress={() => router.push('/login')} 
            style={styles.loginButton}
          >
            <Text style={styles.loginButtonText}>Iniciar sesión</Text>
          </Pressable>
          <Pressable 
            onPress={() => router.push('/register')} 
            style={styles.registerButton}
          >
            <Text style={styles.registerButtonText}>Crear cuenta</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  // Pantalla cuando SÍ está autenticado
  return (
    <View style={styles.container}>
      {/* Header con información del usuario */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Mi Perfil</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color={FalabellaColors.error} />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Información del usuario */}
        <View style={styles.userInfoCard}>
          <View style={styles.userInfoRow}>
            <IconSymbol name="person.fill" size={20} color={FalabellaColors.primary} />
            <View style={styles.userInfoText}>
              <Text style={styles.userInfoLabel}>Nombre</Text>
              <Text style={styles.userInfoValue}>{user?.email?.split('@')[0] || 'Usuario'}</Text>
            </View>
          </View>
          <View style={styles.userInfoRow}>
            <IconSymbol name="envelope.fill" size={20} color={FalabellaColors.primary} />
            <View style={styles.userInfoText}>
              <Text style={styles.userInfoLabel}>Email</Text>
              <Text style={styles.userInfoValue}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Si es ADMIN, mostrar botón para ir a configuración */}
        {user?.role === 'ADMIN' && (
          <Pressable 
            onPress={() => router.push('/admin-settings')} 
            style={styles.configButton}
          >
            <View style={styles.configButtonContent}>
              <IconSymbol name="gearshape.fill" size={24} color={FalabellaColors.primary} />
              <View style={styles.configButtonText}>
                <Text style={styles.configButtonTitle}>Personalización de la Tienda</Text>
                <Text style={styles.configButtonSubtitle}>
                  Configura el logo, nombre y apariencia de tu tienda
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={FalabellaColors.textMuted} />
            </View>
          </Pressable>
        )}

        {/* Mensaje de éxito */}
        {!!msg && (
          <View style={styles.successMessage}>
            <Text style={styles.successText}>{msg}</Text>
          </View>
        )}

        {/* Solo mostrar estas secciones si NO es admin */}
        {user?.role !== 'ADMIN' && (
          <>
        {/* Botón para ver pedidos */}
        <Pressable 
          onPress={() => router.push('/orders')} 
          style={styles.ordersButton}
        >
          <View style={styles.ordersButtonContent}>
            <IconSymbol name="shippingbox.fill" size={24} color={FalabellaColors.primary} />
            <View style={styles.ordersButtonText}>
              <Text style={styles.ordersButtonTitle}>Mis Pedidos</Text>
              <Text style={styles.ordersButtonSubtitle}>
                Ver historial de compras y seguimiento de envíos
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={FalabellaColors.textMuted} />
          </View>
        </Pressable>

        {/* Sección: Dirección de envío */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dirección de envío</Text>
          <TextInput 
            placeholder="Nombre completo" 
            placeholderTextColor={FalabellaColors.textMuted}
            value={shipping.fullName} 
            onChangeText={v => setShipping({ ...shipping, fullName: v })} 
            style={styles.input} 
          />
          <TextInput 
            placeholder="Teléfono" 
            placeholderTextColor={FalabellaColors.textMuted}
            value={shipping.phone} 
            onChangeText={v => setShipping({ ...shipping, phone: v })} 
            keyboardType="phone-pad"
            style={styles.input} 
          />
          <TextInput 
            placeholder="Dirección" 
            placeholderTextColor={FalabellaColors.textMuted}
            value={shipping.address1} 
            onChangeText={v => setShipping({ ...shipping, address1: v })} 
            style={styles.input} 
          />
          <TextInput 
            placeholder="Referencia (opcional)" 
            placeholderTextColor={FalabellaColors.textMuted}
            value={shipping.address2} 
            onChangeText={v => setShipping({ ...shipping, address2: v })} 
            style={styles.input} 
          />
          <TextInput 
            placeholder="Ciudad" 
            placeholderTextColor={FalabellaColors.textMuted}
            value={shipping.city} 
            onChangeText={v => setShipping({ ...shipping, city: v })} 
            style={styles.input} 
          />
          <TextInput 
            placeholder="Estado/Región" 
            placeholderTextColor={FalabellaColors.textMuted}
            value={shipping.state} 
            onChangeText={v => setShipping({ ...shipping, state: v })} 
            style={styles.input} 
          />
          <TextInput 
            placeholder="Código postal" 
            placeholderTextColor={FalabellaColors.textMuted}
            value={shipping.zip} 
            onChangeText={v => setShipping({ ...shipping, zip: v })} 
            keyboardType="number-pad"
            style={styles.input} 
          />
          <TextInput 
            placeholder="País" 
            placeholderTextColor={FalabellaColors.textMuted}
            value={shipping.country} 
            onChangeText={v => setShipping({ ...shipping, country: v })} 
            style={styles.input} 
          />
          <Pressable onPress={saveShipping} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Guardar dirección</Text>
          </Pressable>
        </View>

        {/* Sección: Método de pago */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de pago</Text>
          <TextInput 
            placeholder="Titular de la tarjeta" 
            placeholderTextColor={FalabellaColors.textMuted}
            value={payment.cardholder} 
            onChangeText={v => setPayment({ ...payment, cardholder: v })} 
            style={styles.input} 
          />
          <TextInput 
            placeholder="Número de tarjeta" 
            placeholderTextColor={FalabellaColors.textMuted}
            value={payment.cardNumber} 
            onChangeText={v => setPayment({ ...payment, cardNumber: v })} 
            keyboardType="number-pad"
            maxLength={16}
            style={styles.input} 
          />
          <TextInput 
            placeholder="Expiración (MM/AA)" 
            placeholderTextColor={FalabellaColors.textMuted}
            value={payment.expiry} 
            onChangeText={v => setPayment({ ...payment, expiry: v })} 
            keyboardType="number-pad"
            maxLength={5}
            style={styles.input} 
          />
          <TextInput 
            placeholder="Marca (Visa, Mastercard, etc.)" 
            placeholderTextColor={FalabellaColors.textMuted}
            value={payment.brand} 
            onChangeText={v => setPayment({ ...payment, brand: v })} 
            style={styles.input} 
          />
          <Pressable onPress={savePayment} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Guardar método de pago</Text>
          </Pressable>
        </View>

        {/* Sección: Cambiar contraseña */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cambiar contraseña</Text>
          
          <Text style={styles.inputLabel}>Contraseña actual</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput 
              placeholder="Ingresa tu contraseña actual" 
              placeholderTextColor={FalabellaColors.textMuted}
              secureTextEntry={!showOldPwd}
              value={pwd.old} 
              onChangeText={v => setPwd({ ...pwd, old: v })} 
              style={styles.passwordInput} 
            />
            <Pressable onPress={() => setShowOldPwd(!showOldPwd)} style={styles.eyeButton}>
              <Text style={styles.eyeIcon}>
                {showOldPwd ? '👁️' : '👁️‍🗨️'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.inputLabel}>Nueva contraseña</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput 
              placeholder="Mínimo 6 caracteres" 
              placeholderTextColor={FalabellaColors.textMuted}
              secureTextEntry={!showNewPwd}
              value={pwd.next} 
              onChangeText={v => setPwd({ ...pwd, next: v })} 
              style={styles.passwordInput} 
            />
            <Pressable onPress={() => setShowNewPwd(!showNewPwd)} style={styles.eyeButton}>
              <Text style={styles.eyeIcon}>
                {showNewPwd ? '👁️' : '👁️‍🗨️'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.inputLabel}>Confirmar nueva contraseña</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput 
              placeholder="Repite la nueva contraseña" 
              placeholderTextColor={FalabellaColors.textMuted}
              secureTextEntry={!showConfirmPwd}
              value={pwd.confirm} 
              onChangeText={v => setPwd({ ...pwd, confirm: v })} 
              style={styles.passwordInput} 
            />
            <Pressable onPress={() => setShowConfirmPwd(!showConfirmPwd)} style={styles.eyeButton}>
              <Text style={styles.eyeIcon}>
                {showConfirmPwd ? '👁️' : '👁️‍🗨️'}
              </Text>
            </Pressable>
          </View>
          {!!pwdErr && <Text style={styles.errorText}>{pwdErr}</Text>}
          {!!pwdMsg && <Text style={styles.successText}>{pwdMsg}</Text>}
          <Pressable 
            onPress={changePwd} 
            disabled={pwdLoading} 
            style={[styles.saveButton, pwdLoading && styles.saveButtonDisabled]}
          >
            <Text style={styles.saveButtonText}>
              {pwdLoading ? 'Actualizando…' : 'Actualizar contraseña'}
            </Text>
          </Pressable>
        </View>
          </>
        )}

        {/* Si es ADMIN, mostrar solo cambio de contraseña */}
        {user?.role === 'ADMIN' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cambiar contraseña</Text>
            
            <Text style={styles.inputLabel}>Contraseña actual</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput 
                placeholder="Ingresa tu contraseña actual" 
                placeholderTextColor={FalabellaColors.textMuted}
                secureTextEntry={!showOldPwd}
                value={pwd.old} 
                onChangeText={v => setPwd({ ...pwd, old: v })} 
                style={styles.passwordInput} 
              />
              <Pressable onPress={() => setShowOldPwd(!showOldPwd)} style={styles.eyeButton}>
                <Text style={styles.eyeIcon}>
                  {showOldPwd ? '👁️' : '👁️‍🗨️'}
                </Text>
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Nueva contraseña</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput 
                placeholder="Mínimo 6 caracteres" 
                placeholderTextColor={FalabellaColors.textMuted}
                secureTextEntry={!showNewPwd}
                value={pwd.next} 
                onChangeText={v => setPwd({ ...pwd, next: v })} 
                style={styles.passwordInput} 
              />
              <Pressable onPress={() => setShowNewPwd(!showNewPwd)} style={styles.eyeButton}>
                <Text style={styles.eyeIcon}>
                  {showNewPwd ? '👁️' : '👁️‍🗨️'}
                </Text>
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Confirmar nueva contraseña</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput 
                placeholder="Repite la nueva contraseña" 
                placeholderTextColor={FalabellaColors.textMuted}
                secureTextEntry={!showConfirmPwd}
                value={pwd.confirm} 
                onChangeText={v => setPwd({ ...pwd, confirm: v })} 
                style={styles.passwordInput} 
              />
              <Pressable onPress={() => setShowConfirmPwd(!showConfirmPwd)} style={styles.eyeButton}>
                <Text style={styles.eyeIcon}>
                  {showConfirmPwd ? '👁️' : '👁️‍🗨️'}
                </Text>
              </Pressable>
            </View>
            {!!pwdErr && <Text style={styles.errorText}>{pwdErr}</Text>}
            {!!pwdMsg && <Text style={styles.successText}>{pwdMsg}</Text>}
            <Pressable 
              onPress={changePwd} 
              disabled={pwdLoading} 
              style={[styles.saveButton, pwdLoading && styles.saveButtonDisabled]}
            >
              <Text style={styles.saveButtonText}>
                {pwdLoading ? 'Actualizando…' : 'Actualizar contraseña'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Botón de cerrar sesión */}
        <Pressable onPress={handleLogout} style={styles.logoutButtonFull}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={FalabellaColors.error} />
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
    </View>
  )
}

// Estilos usando los colores de Falabella
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: FalabellaColors.text,
  },
  userEmail: {
    fontSize: 14,
    color: FalabellaColors.textMuted,
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
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
  notAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  notAuthTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: FalabellaColors.text,
    marginTop: 16,
  },
  notAuthSubtitle: {
    fontSize: 15,
    color: FalabellaColors.textLight,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  loginButton: {
    marginTop: 24,
    backgroundColor: FalabellaColors.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: FalabellaColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  registerButton: {
    marginTop: 12,
    borderWidth: 2,
    borderColor: FalabellaColors.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  registerButtonText: {
    color: FalabellaColors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  userInfoCard: {
    backgroundColor: FalabellaColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: FalabellaColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: FalabellaColors.border,
  },
  userInfoText: {
    marginLeft: 12,
    flex: 1,
  },
  userInfoLabel: {
    fontSize: 12,
    color: FalabellaColors.textMuted,
    marginBottom: 2,
  },
  userInfoValue: {
    fontSize: 15,
    color: FalabellaColors.text,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  successMessage: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: FalabellaColors.success,
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    backgroundColor: FalabellaColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: FalabellaColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FalabellaColors.text,
    marginBottom: 16,
  },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: FalabellaColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 15,
    color: FalabellaColors.text,
    backgroundColor: FalabellaColors.white,
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: FalabellaColors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: FalabellaColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: FalabellaColors.error,
    fontSize: 14,
    marginTop: 8,
  },
  logoutButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FalabellaColors.white,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: FalabellaColors.error,
  },
  logoutButtonText: {
    color: FalabellaColors.error,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  configButton: {
    backgroundColor: FalabellaColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: FalabellaColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  configButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  configButtonText: {
    flex: 1,
  },
  configButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FalabellaColors.text,
    marginBottom: 4,
  },
  configButtonSubtitle: {
    fontSize: 14,
    color: FalabellaColors.textMuted,
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: FalabellaColors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FalabellaColors.border,
    borderRadius: 8,
    backgroundColor: FalabellaColors.white,
    marginTop: 4,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 15,
    color: FalabellaColors.text,
  },
  eyeButton: {
    padding: 12,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    fontSize: 20,
  },
  ordersButton: {
    backgroundColor: FalabellaColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: FalabellaColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  ordersButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ordersButtonText: {
    flex: 1,
  },
  ordersButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FalabellaColors.text,
    marginBottom: 4,
  },
  ordersButtonSubtitle: {
    fontSize: 14,
    color: FalabellaColors.textMuted,
    lineHeight: 20,
  },
})