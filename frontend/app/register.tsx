import { useState } from 'react'
import { View, Text, TextInput, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { register } from '@/app/lib/api'

export default function RegisterScreen() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    try {
      setLoading(true); setError('')
      await register(name, email, password)
      router.replace('/login')
    } catch (e: any) {
      setError(e.message || 'Error de registro')
    } finally { setLoading(false) }
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '600' }}>Registrarse</Text>
      <TextInput placeholder="Nombre" value={name} onChangeText={setName} style={{ marginTop: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40 }} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={{ marginTop: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40 }} />
      <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry style={{ marginTop: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40 }} />
      {!!error && <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text>}
      <Pressable onPress={handleRegister} disabled={loading} style={{ marginTop: 12, backgroundColor: '#111', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
        <Text style={{ color: 'white', fontWeight: '600' }}>{loading ? 'Creando…' : 'Crear cuenta'}</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/login')} style={{ marginTop: 12, paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
        <Text style={{ color: '#111' }}>Iniciar sesión</Text>
      </Pressable>
    </View>
  )
}