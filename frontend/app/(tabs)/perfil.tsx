import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { changePassword } from '@/app/lib/api'
import { getToken } from '@/app/lib/auth'

export default function PerfilScreen() {
  const [shipping, setShipping] = useState({
    fullName: '', phone: '', address1: '', address2: '', city: '', state: '', zip: '', country: ''
  })
  const [payment, setPayment] = useState({ cardholder: '', cardNumber: '', expiry: '', brand: '' })
  const [msg, setMsg] = useState('')
  const [pwd, setPwd] = useState({ old: '', next: '', confirm: '' })
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdErr, setPwdErr] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const s = await AsyncStorage.getItem('settings.shipping')
        if (s) setShipping(JSON.parse(s))
        const p = await AsyncStorage.getItem('settings.payment')
        if (p) setPayment(JSON.parse(p))
      } catch {}
    })()
  }, [])

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

  async function changePwd() {
    setPwdErr(''); setPwdMsg('')
    if (!pwd.old || !pwd.next || !pwd.confirm) { setPwdErr('Completa todos los campos'); return }
    if (pwd.next.length < 6) { setPwdErr('La nueva contraseña debe tener al menos 6 caracteres'); return }
    if (pwd.next !== pwd.confirm) { setPwdErr('La confirmación no coincide'); return }
    try {
      setLoading(true)
      const token = await getToken()
      if (!token) { setPwdErr('Inicia sesión para cambiar contraseña'); return }
      await changePassword(token as any, pwd.old, pwd.next)
      setPwdMsg('Contraseña actualizada correctamente')
      setPwd({ old: '', next: '', confirm: '' })
    } catch (e: any) {
      setPwdErr(e.message || 'Error al cambiar la contraseña')
    } finally { setLoading(false) }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '600' }}>Perfil</Text>
      {!!msg && <Text style={{ color: 'green', marginTop: 8 }}>{msg}</Text>}

      <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#eee', marginTop: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>Dirección de envío</Text>
        <TextInput placeholder="Nombre completo" value={shipping.fullName} onChangeText={v => setShipping({ ...shipping, fullName: v })} style={{ marginTop: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40 }} />
        <TextInput placeholder="Teléfono" value={shipping.phone} onChangeText={v => setShipping({ ...shipping, phone: v })} style={{ marginTop: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40 }} />
        <TextInput placeholder="Dirección" value={shipping.address1} onChangeText={v => setShipping({ ...shipping, address1: v })} style={{ marginTop: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40 }} />
        <TextInput placeholder="Referencia" value={shipping.address2} onChangeText={v => setShipping({ ...shipping, address2: v })} style={{ marginTop: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40 }} />
        <TextInput placeholder="Ciudad" value={shipping.city} onChangeText={v => setShipping({ ...shipping, city: v })} style={{ marginTop: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40 }} />
        <TextInput placeholder="Estado" value={shipping.state} onChangeText={v => setShipping({ ...shipping, state: v })} style={{ marginTop: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40 }} />
        <TextInput placeholder="Código postal" value={shipping.zip} onChangeText={v => setShipping({ ...shipping, zip: v })} style={{ marginTop: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40 }} />
        <TextInput placeholder="País" value={shipping.country} onChangeText={v => setShipping({ ...shipping, country: v })} style={{ marginTop: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40 }} />
        <Pressable onPress={saveShipping} style={{ marginTop: 12, backgroundColor: '#111', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
          <Text style={{ color: 'white', fontWeight: '600' }}>Guardar dirección</Text>
        </Pressable>
      </View>

      <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#eee', marginTop: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>Método de pago</Text>
        <TextInput placeholder="Titular" value={payment.cardholder} onChangeText={v => setPayment({ ...payment, cardholder: v })} style={{ marginTop: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40 }} />
        <TextInput placeholder="Número de tarjeta" value={payment.cardNumber} onChangeText={v => setPayment({ ...payment, cardNumber: v })} style={{ marginTop: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40 }} />
        <TextInput placeholder="Expiración (MM/AA)" value={payment.expiry} onChangeText={v => setPayment({ ...payment, expiry: v })} style={{ marginTop: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40 }} />
        <TextInput placeholder="Marca" value={payment.brand} onChangeText={v => setPayment({ ...payment, brand: v })} style={{ marginTop: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40 }} />
        <Pressable onPress={savePayment} style={{ marginTop: 12, backgroundColor: '#111', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
          <Text style={{ color: 'white', fontWeight: '600' }}>Guardar método de pago</Text>
        </Pressable>
      </View>

      <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#eee', marginTop: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>Cambiar contraseña</Text>
        <TextInput placeholder="Actual" secureTextEntry value={pwd.old} onChangeText={v => setPwd({ ...pwd, old: v })} style={{ marginTop: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40 }} />
        <TextInput placeholder="Nueva" secureTextEntry value={pwd.next} onChangeText={v => setPwd({ ...pwd, next: v })} style={{ marginTop: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40 }} />
        <TextInput placeholder="Confirmar" secureTextEntry value={pwd.confirm} onChangeText={v => setPwd({ ...pwd, confirm: v })} style={{ marginTop: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40 }} />
        {!!pwdErr && <Text style={{ color: 'red', marginTop: 8 }}>{pwdErr}</Text>}
        {!!pwdMsg && <Text style={{ color: 'green', marginTop: 8 }}>{pwdMsg}</Text>}
        <Pressable onPress={changePwd} disabled={loading} style={{ marginTop: 12, backgroundColor: '#111', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
          <Text style={{ color: 'white', fontWeight: '600' }}>{loading ? 'Actualizando…' : 'Actualizar contraseña'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}