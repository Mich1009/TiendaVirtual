import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProduct } from '../lib/api.js'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const data = await getProduct(id)
        setProduct(data)
      } catch (e) {
        setError(e.message || 'Error al cargar el producto')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) return <section className="container py-8"><p>Cargando…</p></section>
  if (error) return <section className="container py-8"><p className="text-red-600">{error}</p></section>
  if (!product) return <section className="container py-8"><p>Producto no disponible</p></section>

  const img = product.images && product.images[0] ? product.images[0].url : 'https://via.placeholder.com/800x500?text=Producto'

  function addToCart() {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login', { state: { from: `/products/${product.id}` } })
      return
    }
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find(i => i.id === product.id)
    if (existing) existing.qty += 1
    else cart.push({ id: product.id, name: product.name, price: product.price, img, qty: 1 })
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    navigate('/cart')
  }

  return (
    <section className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card overflow-hidden">
          <img src={img} alt={product.name} className="w-full h-[420px] object-cover" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="mt-2 text-neutral-600">{product.description || 'Sin descripción'}</p>
          <p className="mt-4 text-3xl font-bold">${Number(product.price).toFixed(2)}</p>
          <div className="mt-6 flex gap-3">
            <button className="btn" onClick={addToCart}>Añadir al carrito</button>
          </div>
        </div>
      </div>
    </section>
  )
}