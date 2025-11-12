import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Cart() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setItems(cart)
  }, [])

  function updateQty(id, qty) {
    const next = items.map(i => i.id === id ? { ...i, qty } : i)
    setItems(next)
    localStorage.setItem('cart', JSON.stringify(next))
    window.dispatchEvent(new Event('cart-updated'))
  }

  function removeItem(id) {
    const next = items.filter(i => i.id !== id)
    setItems(next)
    localStorage.setItem('cart', JSON.stringify(next))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  return (
    <section className="container py-8">
      <h2 className="text-2xl font-semibold">Carrito</h2>
      {items.length === 0 ? (
        <div className="mt-6">
          <p>Tu carrito está vacío.</p>
          <Link className="btn mt-4" to="/">Explorar productos</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map(i => (
              <div key={i.id} className="card p-4 flex items-center gap-4">
                <img src={i.img} alt={i.name} className="w-24 h-24 object-cover rounded-md" />
                <div className="flex-1">
                  <p className="font-medium">{i.name}</p>
                  <p className="text-neutral-600">${Number(i.price).toFixed(2)}</p>
                </div>
                <input type="number" min="1" value={i.qty} onChange={(e)=>updateQty(i.id, Number(e.target.value))} className="input w-20" />
                <button className="btn" onClick={()=>removeItem(i.id)}>Quitar</button>
              </div>
            ))}
          </div>
          <div className="card p-6">
            <p className="text-lg">Total</p>
            <p className="text-3xl font-bold mt-2">${total.toFixed(2)}</p>
            <button
              className="btn w-full mt-6"
              onClick={() => {
                const token = localStorage.getItem('token')
                if (!token) {
                  navigate('/login', { state: { from: '/checkout' } })
                } else {
                  navigate('/checkout')
                }
              }}
            >
              Proceder al pago
            </button>
          </div>
        </div>
      )}
    </section>
  )
}