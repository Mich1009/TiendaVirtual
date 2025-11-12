import { useState } from 'react'
import { View, Text } from 'react-native'
import Screen from '../ui/Screen'
import Input from '../ui/Input'
import Btn from '../ui/Button'
import { forgotPassword } from '../lib/api'

export default function Recover({ navigation }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generated, setGenerated] = useState('')
  const [message, setMessage] = useState('')

  const onSubmit = async () => {
    try {
      setLoading(true); setError(''); setGenerated(''); setMessage('')
      const data = await forgotPassword(email)
      if (data.generatedPassword) {
        setGenerated(data.generatedPassword)
      } else {
        setMessage('Si tu correo existe y SMTP está configurado, te hemos enviado una contraseña temporal.')
      }
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  return (
    <Screen center>
      <Text style={{ fontSize: 24, fontWeight: '800' }}>Recuperar contraseña</Text>
      <Text style={{ color: '#666', marginTop: 6 }}>Genera una contraseña temporal.</Text>
      <Input label="Correo" value={email} onChangeText={setEmail} placeholder="you@example.com" inputMode="email" autoCapitalize="none" />
      {!!error && <Text style={{ color: 'red', marginTop: 12 }}>{error}</Text>}
      <View style={{ marginTop: 16 }}>
        <Btn title={loading ? 'Generando…' : 'Generar contraseña'} onPress={onSubmit} disabled={loading || !email} loading={loading} />
      </View>

      {!!generated && (
        <View style={{ marginTop: 16, padding: 16, backgroundColor: '#f0fff4', borderColor: '#c6f6d5', borderWidth: 1, borderRadius: 10 }}>
          <Text style={{ color: '#2f855a', fontWeight: '600' }}>Contraseña temporal generada:</Text>
          <Text selectable style={{ marginTop: 8, fontWeight: '700' }}>{generated}</Text>
          <View style={{ marginTop: 12 }}>
            <Btn variant="secondary" title="Ir a iniciar sesión" onPress={() => navigation.navigate('Login')} />
          </View>
        </View>
      )}

      {!!message && (
        <Text style={{ color: '#2f855a', marginTop: 12 }}>{message}</Text>
      )}
    </Screen>
  )
}