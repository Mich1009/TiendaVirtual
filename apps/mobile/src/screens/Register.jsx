import { useState } from 'react'
import { View, Text } from 'react-native'
import Screen from '../ui/Screen'
import Input from '../ui/Input'
import Btn from '../ui/Button'
import { register } from '../lib/api'

export default function Register({ navigation }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onSubmit = async () => {
    try {
      setLoading(true); setError(''); setSuccess('')
      await register({ name, email, password })
      setSuccess('Registro exitoso. Ahora inicia sesión.')
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  return (
    <Screen center>
      <Text style={{ fontSize: 24, fontWeight: '800' }}>Crear cuenta</Text>
      <Text style={{ color: '#666', marginTop: 6 }}>Compra y rastrea tus pedidos.</Text>
      <Input label="Nombre" value={name} onChangeText={setName} placeholder="Juan Pérez" />
      <Input label="Correo" value={email} onChangeText={setEmail} placeholder="you@example.com" inputMode="email" autoCapitalize="none" />
      <Input label="Contraseña" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry autoCapitalize="none" />
      {!!error && <Text style={{ color: 'red', marginTop: 12 }}>{error}</Text>}
      {!!success && <Text style={{ color: 'green', marginTop: 12 }}>{success}</Text>}
      <View style={{ marginTop: 16 }}>
        <Btn title={loading ? 'Registrando…' : 'Registrarse'} onPress={onSubmit} disabled={loading || !name || !email || !password} loading={loading} />
      </View>
      <View style={{ marginTop: 12 }}>
        <Btn variant="secondary" title="Ir a iniciar sesión" onPress={() => navigation.navigate('Login')} />
      </View>
    </Screen>
  )
}