import { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { login } from '@/lib/api'
import { setToken } from '@/lib/auth'
import { FalabellaColors } from '@/constants/theme'
import { IconSymbol } from '@/components/ui/icon-symbol'

export default function IniciarSesionScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function manejarInicioSesion() {
    try {
      setLoading(true)
      setError('')
      
      if (!email || !password) {
        setError('Por favor completa todos los campos')
        return
      }

      const res = await login(email, password)
      await setToken(res.token)
      router.replace('/(tabs)/catalog')
    } catch (e: any) {
      setError(e.message || 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>Tienda</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo electrónico</Text>
            <View style={styles.inputWrapper}>
              <IconSymbol name="envelope.fill" size={20} color={FalabellaColors.textMuted} />
              <TextInput
                placeholder="tu@email.com"
                placeholderTextColor={FalabellaColors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <IconSymbol name="lock.fill" size={20} color={FalabellaColors.textMuted} />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={FalabellaColors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                style={styles.input}
              />
              <Pressable 
                onPress={() => setShowPassword(!showPassword)} 
                style={styles.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.eyeIcon}>
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </Text>
              </Pressable>
            </View>
          </View>

          {!!error && (
            <View style={styles.errorContainer}>
              <IconSymbol name="exclamationmark.circle.fill" size={20} color={FalabellaColors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable 
            onPress={manejarInicioSesion} 
            disabled={loading} 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Text>
          </Pressable>

          <Pressable onPress={() => (router as any).push('/recuperar-contrasena')} style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable onPress={() => router.push('/register')} style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Crear cuenta nueva</Text>
          </Pressable>

          <Pressable onPress={() => router.push('/(tabs)/catalog')} style={styles.homeButton}>
            <IconSymbol name="house.fill" size={20} color={FalabellaColors.textMuted} />
            <Text style={styles.homeButtonText}>Continuar sin iniciar sesión</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FalabellaColors.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    color: FalabellaColors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: FalabellaColors.textLight,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: FalabellaColors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FalabellaColors.backgroundGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: FalabellaColors.border,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    fontSize: 16,
    color: FalabellaColors.text,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: FalabellaColors.error,
  },
  loginButton: {
    backgroundColor: FalabellaColors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: FalabellaColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: FalabellaColors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: FalabellaColors.textMuted,
  },
  registerButton: {
    borderWidth: 2,
    borderColor: FalabellaColors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
    color: FalabellaColors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  homeButtonText: {
    color: FalabellaColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  eyeButton: {
    padding: 8,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    fontSize: 20,
  },
  forgotPasswordButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  forgotPasswordText: {
    color: FalabellaColors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
})