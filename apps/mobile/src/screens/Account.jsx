import { useState, useEffect } from 'react'
import { View, Text } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Screen from '../ui/Screen'
import Input from '../ui/Input'
import Btn from '../ui/Button'
import Card from '../ui/Card'
import { changePassword } from '../lib/api'

export default function Account({ token, onLogout }) {
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [shipSaved, setShipSaved] = useState('')
  const [paySaved, setPaySaved] = useState('')
  const [shipping, setShipping] = useState({ fullName: '', phone: '', address1: '', address2: '', city: '', state: '', zip: '', country: '' })
  const [payment, setPayment] = useState({ cardholder: '', cardNumber: '', expiry: '', brand: '' })

  useEffect(() => {
    (async () => {
      try {
        const s = JSON.parse((await AsyncStorage.getItem('settings.shipping')) || 'null')
        if (s) setShipping(s)
        const p = JSON.parse((await AsyncStorage.getItem('settings.payment')) || 'null')
        if (p) setPayment(p)
      } catch {}
    })()
  }, [])

  const onSubmit = async () => {
    try {
      setLoading(true); setError(''); setSuccess('')
      await changePassword(token, { oldPassword: oldPwd, newPassword: newPwd })
      setSuccess('Contraseña actualizada correctamente.')
      setOldPwd(''); setNewPwd('')
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  const saveShipping = async () => {
    await AsyncStorage.setItem('settings.shipping', JSON.stringify(shipping))
    setShipSaved('Dirección guardada correctamente.')
    setTimeout(() => setShipSaved(''), 2500)
  }

  const savePayment = async () => {
    const digits = (payment.cardNumber || '').replace(/\D/g, '')
    const last4 = digits.slice(-4)
    const payload = { cardholder: payment.cardholder, expiry: payment.expiry, brand: payment.brand, last4 }
    await AsyncStorage.setItem('settings.payment', JSON.stringify(payload))
    setPaySaved('Método de pago guardado (marca y últimos 4).')
    setTimeout(() => setPaySaved(''), 2500)
  }

  return (
    <Screen padded>
      <Text style={{ fontSize: 24, fontWeight: '800' }}>Cuenta</Text>
      <Text style={{ color: '#666', marginTop: 6 }}>Actualiza tu contraseña, dirección y método de pago.</Text>

      <View style={{ marginTop: 16 }}>
        <Card>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>Cambiar contraseña</Text>
          <Input label="Contraseña actual" value={oldPwd} onChangeText={setOldPwd} placeholder="••••••••" secureTextEntry />
          <Input label="Nueva contraseña" value={newPwd} onChangeText={setNewPwd} placeholder="••••••••" secureTextEntry />
          {!!error && <Text style={{ color: 'red', marginTop: 12 }}>{error}</Text>}
          {!!success && <Text style={{ color: 'green', marginTop: 12 }}>{success}</Text>}
          <View style={{ marginTop: 16 }}>
            <Btn title={loading ? 'Guardando…' : 'Actualizar contraseña'} onPress={onSubmit} disabled={loading || !oldPwd || !newPwd} loading={loading} />
          </View>
        </Card>
      </View>

      <View style={{ marginTop: 16 }}>
        <Card>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>Dirección de envío</Text>
          <Input label="Nombre completo" value={shipping.fullName} onChangeText={(v)=>setShipping(s=>({...s, fullName:v}))} placeholder="Juan Pérez" />
          <Input label="Teléfono" value={shipping.phone} onChangeText={(v)=>setShipping(s=>({...s, phone:v}))} placeholder="555-123-4567" />
          <Input label="Dirección 1" value={shipping.address1} onChangeText={(v)=>setShipping(s=>({...s, address1:v}))} placeholder="Calle 123" />
          <Input label="Referencia (opcional)" value={shipping.address2} onChangeText={(v)=>setShipping(s=>({...s, address2:v}))} placeholder="Depto, referencia" />
          <View style={{ flexDirection:'row', gap:12 }}>
            <View style={{ flex:1 }}>
              <Input label="Ciudad" value={shipping.city} onChangeText={(v)=>setShipping(s=>({...s, city:v}))} />
            </View>
            <View style={{ flex:1 }}>
              <Input label="Estado/Provincia" value={shipping.state} onChangeText={(v)=>setShipping(s=>({...s, state:v}))} />
            </View>
          </View>
          <View style={{ flexDirection:'row', gap:12 }}>
            <View style={{ flex:1 }}>
              <Input label="Código postal" value={shipping.zip} onChangeText={(v)=>setShipping(s=>({...s, zip:v}))} />
            </View>
            <View style={{ flex:1 }}>
              <Input label="País" value={shipping.country} onChangeText={(v)=>setShipping(s=>({...s, country:v}))} placeholder="México" />
            </View>
          </View>
          {!!shipSaved && <Text style={{ color:'green', marginTop:12 }}>{shipSaved}</Text>}
          <View style={{ marginTop: 16 }}>
            <Btn title="Guardar dirección" onPress={saveShipping} />
          </View>
        </Card>
      </View>

      <View style={{ marginTop: 16 }}>
        <Card>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>Método de pago</Text>
          <Input label="Titular" value={payment.cardholder} onChangeText={(v)=>setPayment(p=>({...p, cardholder:v}))} placeholder="Juan Pérez" />
          <Input label="Número de tarjeta" value={payment.cardNumber} onChangeText={(v)=>setPayment(p=>({...p, cardNumber:v}))} placeholder="4111 1111 1111 1111" />
          <View style={{ flexDirection:'row', gap:12 }}>
            <View style={{ flex:1 }}>
              <Input label="Expiración (MM/AA)" value={payment.expiry} onChangeText={(v)=>setPayment(p=>({...p, expiry:v}))} placeholder="12/28" />
            </View>
            <View style={{ flex:1 }}>
              <Input label="Marca" value={payment.brand} onChangeText={(v)=>setPayment(p=>({...p, brand:v}))} placeholder="Visa / Mastercard" />
            </View>
          </View>
          <Text style={{ fontSize: 12, color: '#666', marginTop: 6 }}>Por seguridad, solo guardamos marca, expiración y últimos 4 dígitos.</Text>
          {!!paySaved && <Text style={{ color:'green', marginTop:12 }}>{paySaved}</Text>}
          <View style={{ marginTop: 16 }}>
            <Btn title="Guardar método de pago" onPress={savePayment} />
          </View>
        </Card>
      </View>

      <View style={{ marginTop: 24 }}>
        <Btn variant="secondary" title="Cerrar sesión" onPress={onLogout} />
      </View>
    </Screen>
  )
}