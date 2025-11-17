/**
 * Pantalla de Recuperación de Contraseña
 * 
 * Permite a los usuarios recuperar su contraseña:
 * 1. Solicitar contraseña temporal por email
 * 2. Usar la contraseña temporal para iniciar sesión
 */

import { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { forgotPassword } from '@/lib/api'
import { FalabellaColors } from '@/constants/theme'
import { IconSymbol } from '@/components/ui/icon-symbol'
import Alert from '@/lib/global-alert'

export default function RecuperarContrasenaScreen() {
  const router = useRouter()
  
  // Estados del formulario
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Solicitar contraseña temporal
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email')
      return
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido')
      return
    }

    setLoading(true)
    try {
      const response = await forgotPassword(email)
      setSuccess(true)
      
      // En desarrollo, mostrar la contraseña temporal si está disponible
      if (response.generatedPassword) {
        Alert.alert(
          'Contraseña temporal generada',
          `Tu nueva contraseña temporal es: ${response.generatedPassword}\n\nUsa esta contraseña para iniciar sesión y luego cámbiala en tu perfil.`,
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        )
      } else {
        Alert.alert(
          'Contraseña enviada',
          'Se ha generado una contraseña temporal y se ha enviado a tu email. Revisa tu bandeja de entrada.',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        )
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo procesar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={FalabellaColors.primary} />
          </Pressable>
          <Text style={styles.title}>Recuperar Contraseña</Text>
        </View>

        {/* Formulario de recuperación */}
        {!success ? (
          <View style={styles.form}>
            <Text style={styles.subtitle}>
              Ingresa tu email y te generaremos una contraseña temporal que podrás usar para iniciar sesión
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <Pressable 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleForgotPassword}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Procesando...' : 'Generar Contraseña Temporal'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.successContainer}>
              <IconSymbol name="checkmark.circle.fill" size={64} color={FalabellaColors.success} />
              <Text style={styles.successTitle}>¡Listo!</Text>
              <Text style={styles.successText}>
                Se ha generado una contraseña temporal para tu cuenta. 
                {'\n\n'}
                Revisa tu email o usa la contraseña que se mostró en pantalla para iniciar sesión.
                {'\n\n'}
                Por seguridad, te recomendamos cambiar tu contraseña una vez que inicies sesión.
              </Text>
              
              <Pressable 
                style={styles.button} 
                onPress={() => router.replace('/login')}
              >
                <Text style={styles.buttonText}>Ir a Iniciar Sesión</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Link para volver al login */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Recordaste tu contraseña? </Text>
          <Pressable onPress={() => router.replace('/login')}>
            <Text style={styles.footerLink}>Iniciar Sesión</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: FalabellaColors.text,
  },
  form: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: FalabellaColors.textLight,
    marginBottom: 30,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: FalabellaColors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: FalabellaColors.border,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: FalabellaColors.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 15,
  },
  linkText: {
    color: FalabellaColors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: FalabellaColors.textLight,
  },
  footerLink: {
    fontSize: 16,
    color: FalabellaColors.primary,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: FalabellaColors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  successText: {
    fontSize: 16,
    color: FalabellaColors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
})