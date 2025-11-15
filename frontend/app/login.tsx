import { useState } from 'react'
import { View, Text, TextInput, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { login } from '@/app/lib/api'
import { setToken } from '@/app/lib/auth'

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    try {
      setLoading(true); setError('')
      const res = await login(email, password)
      await setToken(res.token)
      router.replace('/(tabs)/catalog')
    } catch (e: any) {
      setError(e.message || 'Error de autenticación')
    } finally { setLoading(false) }
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '600' }}>Iniciar sesión</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={{ marginTop: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40 }} />
      <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry style={{ marginTop: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40 }} />
      {!!error && <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text>}
      <Pressable onPress={handleLogin} disabled={loading} style={{ marginTop: 12, backgroundColor: '#111', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
        <Text style={{ color: 'white', fontWeight: '600' }}>{loading ? 'Entrando…' : 'Entrar'}</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/register')} style={{ marginTop: 12, paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
        <Text style={{ color: '#111' }}>Crear cuenta</Text>
      </Pressable>
    </View>
  )
}