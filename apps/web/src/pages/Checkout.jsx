import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder } from '../lib/api.js'

export default function Checkout() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cardNumber, setCardNumber] = useState('')

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setItems(cart)
  }, [])

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  async function handlePay() {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login', { state: { from: '/checkout' } })
        return
      }
      // cargar configuración guardada y generar datos aleatorios si faltan
      let shipping = {}
      let payment = {}
      try {
        const s = JSON.parse(localStorage.getItem('settings.shipping') || 'null')
        if (s) shipping = s
        const p = JSON.parse(localStorage.getItem('settings.payment') || 'null')
        if (p) payment = p
      } catch {}

      // Si no hay shipping, generar datos simples aleatorios
      if (!shipping.fullName) {
        const nombres = ['Juan Pérez','María López','Carlos García','Ana Torres']
        const ciudades = ['CDMX','Guadalajara','Monterrey','Puebla']
        shipping = {
          fullName: nombres[Math.floor(Math.random()*nombres.length)],
          phone: `55${Math.floor(10000000 + Math.random()*89999999)}`,
          address1: `Calle ${Math.floor(Math.random()*200)} #${Math.floor(Math.random()*999)}`,
          address2: '',
          city: ciudades[Math.floor(Math.random()*ciudades.length)],
          state: 'NA',
          zip: String(10000 + Math.floor(Math.random()*89999)),
          country: 'México'
        }
      }

      // Payment: tomar número ingresado aquí para la simulación
      const digits = (cardNumber || '').replace(/\D/g, '')
      payment = {
        ...payment,
        cardNumber: digits
      }

      const payload = {
        items: items.map(i => ({ productId: i.id, quantity: i.qty })),
        shipping,
        payment
      }
      const order = await createOrder(token, payload)
      localStorage.removeItem('cart')
      window.dispatchEvent(new Event('cart-updated'))
      navigate(`/order/${order.id}`, { state: { order } })
    } catch (e) {
      setError(e.message || 'Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container py-8">
      <h2 className="text-2xl font-semibold">Checkout</h2>
      {items.length === 0 ? (
        <p className="mt-6">No hay productos en el carrito.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map(i => (
              <div key={i.id} className="card p-4 flex items-center gap-4">
                <img src={i.img} alt={i.name} className="w-20 h-20 object-cover rounded-md" />
                <div className="flex-1">
                  <p className="font-medium">{i.name}</p>
                  <p className="text-neutral-600">x{i.qty}</p>
                </div>
                <p className="font-semibold">${(i.price * i.qty).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="card p-6">
            <p className="text-lg">Total</p>
            <p className="text-3xl font-bold mt-2">${total.toFixed(2)}</p>
            <div className="mt-4">
              <label className="text-sm text-neutral-600">Número de tarjeta (simulación)</label>
              <input className="input mt-1" value={cardNumber} onChange={e=>setCardNumber(e.target.value)} placeholder="4111 1111 1111 1111" />
              <p className="text-xs text-neutral-500 mt-1">No validamos ni guardamos el número completo; se utiliza para derivar marca y últimos 4.</p>
            </div>
            {error && <p className="text-red-600 mt-4">{error}</p>}
            <button className="btn w-full mt-6" onClick={handlePay} disabled={loading}>
              {loading ? 'Procesando…' : 'Pagar'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}