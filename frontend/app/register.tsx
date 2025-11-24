import { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { register } from '@/lib/api'
import { FalabellaColors } from '@/constants/theme'
import { IconSymbol } from '@/components/ui/icon-symbol'

export default function RegistrarseScreen() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  async function manejarRegistro() {
    try {
      setLoading(true)
      setError('')

      if (!name || !email || !password || !confirmPassword) {
        setError('Por favor completa todos los campos')
        return
      }

      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres')
        return
      }

      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden')
        return
      }

      await register(name, email, password)
      router.replace('/login')
    } catch (e: any) {
      setError(e.message || 'Error de registro')
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
          <Text style={styles.subtitle}>Crea tu cuenta para comenzar</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre completo</Text>
            <View style={styles.inputWrapper}>
              <IconSymbol name="person.fill" size={20} color={FalabellaColors.textMuted} />
              <TextInput
                placeholder="Juan Pérez"
                placeholderTextColor={FalabellaColors.textMuted}
                value={name}
                onChangeText={setName}
                autoComplete="name"
                style={styles.input}
              />
            </View>
          </View>

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
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={FalabellaColors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password-new"
                style={styles.input}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <IconSymbol 
                  name={showPassword ? "eye.slash.fill" : "eye.fill"} 
                  size={20} 
                  color={FalabellaColors.textMuted} 
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar contraseña</Text>
            <View style={styles.inputWrapper}>
              <IconSymbol name="lock.fill" size={20} color={FalabellaColors.textMuted} />
              <TextInput
                placeholder="Repite tu contraseña"
                placeholderTextColor={FalabellaColors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoComplete="password-new"
                style={styles.input}
              />
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <IconSymbol 
                  name={showConfirmPassword ? "eye.slash.fill" : "eye.fill"} 
                  size={20} 
                  color={FalabellaColors.textMuted} 
                />
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
            onPress={manejarRegistro} 
            disabled={loading} 
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable onPress={() => router.push('/login')} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Ya tengo cuenta</Text>
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
    marginBottom: 32,
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
    marginBottom: 16,
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
    fontSize: 16,
    color: FalabellaColors.text,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: FalabellaColors.error,
  },
  registerButton: {
    backgroundColor: FalabellaColors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
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
  loginButton: {
    borderWidth: 2,
    borderColor: FalabellaColors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: FalabellaColors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
})