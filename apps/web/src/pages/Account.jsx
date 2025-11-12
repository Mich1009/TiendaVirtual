import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, getToken } from '../lib/auth.js'
import { changePassword } from '../lib/api.js'

export default function Account() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [shipping, setShipping] = useState({
    fullName: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  })
  const [payment, setPayment] = useState({
    cardholder: '',
    cardNumber: '',
    expiry: '',
    brand: ''
  })
  const [savedMsg, setSavedMsg] = useState('')
  const [pwd, setPwd] = useState({ old: '', next: '', confirm: '' })
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdErr, setPwdErr] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)

  useEffect(() => {
    const u = getUser()
    if (!u) {
      navigate('/login', { state: { from: '/account' } })
      return
    }
    setUser(u)
    // cargar desde localStorage
    try {
      const s = JSON.parse(localStorage.getItem('settings.shipping') || 'null')
      if (s) setShipping(s)
      const p = JSON.parse(localStorage.getItem('settings.payment') || 'null')
      if (p) setPayment(p)
    } catch {}
  }, [navigate])

  function saveShipping(e) {
    e.preventDefault()
    localStorage.setItem('settings.shipping', JSON.stringify(shipping))
    setSavedMsg('Dirección de envío guardada')
    setTimeout(() => setSavedMsg(''), 2000)
  }

  function savePayment(e) {
    e.preventDefault()
    // almacenar solo lo necesario (evitar CVV, etc.)
    const data = { ...payment }
    // derivar brand y last4
    const digits = (data.cardNumber || '').replace(/\D/g, '')
    data.brand = data.brand || (digits.startsWith('4') ? 'Visa' : digits.startsWith('5') ? 'Mastercard' : '')
    if (digits.length >= 4) data.last4 = digits.slice(-4)
    // no guardar número completo por seguridad
    delete data.cardNumber
    localStorage.setItem('settings.payment', JSON.stringify(data))
    setSavedMsg('Método de pago guardado')
    setTimeout(() => setSavedMsg(''), 2000)
  }

  return (
    <section className="container py-8">
      <h2 className="text-2xl font-semibold">Configuración de cuenta</h2>
      {user && (
        <p className="mt-2 text-neutral-600">Sesión: {user.email} · Rol: {user.role === 'ADMIN' ? 'Admin' : 'Cliente'}</p>
      )}
      {savedMsg && <p className="mt-4 text-green-700">{savedMsg}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <form onSubmit={saveShipping} className="card p-6">
          <h3 className="text-lg font-medium">Dirección de envío</h3>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm text-neutral-600">Nombre completo</label>
              <input className="input mt-1" value={shipping.fullName} onChange={e=>setShipping({...shipping, fullName: e.target.value})} placeholder="Juan Pérez" />
            </div>
            <div>
              <label className="text-sm text-neutral-600">Teléfono</label>
              <input className="input mt-1" value={shipping.phone} onChange={e=>setShipping({...shipping, phone: e.target.value})} placeholder="999 999 999" />
            </div>
            <div>
              <label className="text-sm text-neutral-600">Dirección</label>
              <input className="input mt-1" value={shipping.address1} onChange={e=>setShipping({...shipping, address1: e.target.value})} placeholder="Av. Siempre Viva 123" />
            </div>
            <div>
              <label className="text-sm text-neutral-600">Referencia (opcional)</label>
              <input className="input mt-1" value={shipping.address2} onChange={e=>setShipping({...shipping, address2: e.target.value})} placeholder="Depto, referencia" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-neutral-600">Ciudad</label>
                <input className="input mt-1" value={shipping.city} onChange={e=>setShipping({...shipping, city: e.target.value})} />
              </div>
              <div>
                <label className="text-sm text-neutral-600">Estado/Provincia</label>
                <input className="input mt-1" value={shipping.state} onChange={e=>setShipping({...shipping, state: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-neutral-600">Código postal</label>
                <input className="input mt-1" value={shipping.zip} onChange={e=>setShipping({...shipping, zip: e.target.value})} />
              </div>
              <div>
                <label className="text-sm text-neutral-600">País</label>
                <input className="input mt-1" value={shipping.country} onChange={e=>setShipping({...shipping, country: e.target.value})} placeholder="Perú" />
              </div>
            </div>
          </div>
          <button className="btn mt-6" type="submit">Guardar dirección</button>
        </form>

        <form onSubmit={savePayment} className="card p-6">
          <h3 className="text-lg font-medium">Método de pago</h3>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm text-neutral-600">Titular</label>
              <input className="input mt-1" value={payment.cardholder} onChange={e=>setPayment({...payment, cardholder: e.target.value})} placeholder="Juan Pérez" />
            </div>
            <div>
              <label className="text-sm text-neutral-600">Número de tarjeta</label>
              <input className="input mt-1" value={payment.cardNumber} onChange={e=>setPayment({...payment, cardNumber: e.target.value})} placeholder="4111 1111 1111 1111" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-neutral-600">Expiración (MM/AA)</label>
                <input className="input mt-1" value={payment.expiry} onChange={e=>setPayment({...payment, expiry: e.target.value})} placeholder="12/28" />
              </div>
              <div>
                <label className="text-sm text-neutral-600">Marca</label>
                <input className="input mt-1" value={payment.brand} onChange={e=>setPayment({...payment, brand: e.target.value})} placeholder="Visa / Mastercard" />
              </div>
            </div>
            <p className="text-xs text-neutral-500">Por seguridad, solo guardamos marca, expiración y últimos 4 dígitos.</p>
          </div>
          <button className="btn mt-6" type="submit">Guardar método de pago</button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-8 mt-8">
        <form className="card p-6" onSubmit={async (e) => {
          e.preventDefault()
          setPwdErr(''); setPwdMsg('')
          if (!pwd.old || !pwd.next || !pwd.confirm) { setPwdErr('Completa todos los campos'); return }
          if (pwd.next.length < 6) { setPwdErr('La nueva contraseña debe tener al menos 6 caracteres'); return }
          if (pwd.next !== pwd.confirm) { setPwdErr('La confirmación no coincide'); return }
          try {
            setPwdLoading(true)
            const token = getToken()
            await changePassword(token, pwd.old, pwd.next)
            setPwdMsg('Contraseña actualizada correctamente')
            setPwd({ old: '', next: '', confirm: '' })
          } catch (e) {
            setPwdErr(e.message || 'Error al cambiar la contraseña')
          } finally {
            setPwdLoading(false)
          }
        }}>
          <h3 className="text-lg font-medium">Cambiar contraseña</h3>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm text-neutral-600">Contraseña actual</label>
              <input className="input mt-1" type="password" value={pwd.old} onChange={e=>setPwd({...pwd, old: e.target.value})} placeholder="••••••••" autoComplete="current-password" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-neutral-600">Nueva contraseña</label>
                <input className="input mt-1" type="password" value={pwd.next} onChange={e=>setPwd({...pwd, next: e.target.value})} placeholder="••••••••" autoComplete="new-password" />
              </div>
              <div>
                <label className="text-sm text-neutral-600">Confirmar nueva</label>
                <input className="input mt-1" type="password" value={pwd.confirm} onChange={e=>setPwd({...pwd, confirm: e.target.value})} placeholder="••••••••" autoComplete="new-password" />
              </div>
            </div>
            {pwdErr && <p className="text-red-600">{pwdErr}</p>}
            {pwdMsg && <p className="text-green-700">{pwdMsg}</p>}
          </div>
          <button className="btn mt-6" type="submit" disabled={pwdLoading}>{pwdLoading ? 'Actualizando…' : 'Actualizar contraseña'}</button>
        </form>
      </div>
    </section>
  )
}