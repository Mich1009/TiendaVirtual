import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders } from '../lib/api.js'

export default function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login', { state: { from: '/orders' } })
        return
      }
      try {
        const data = await getOrders(token)
        const list = Array.isArray(data) ? data : data.items || data.orders || []
        setOrders(list)
      } catch (e) {
        setError(e.message || 'Error al cargar pedidos')
      } finally {
        setLoading(false)
      }
    })()
  }, [navigate])

  return (
    <section className="container py-8">
      <h2 className="text-2xl font-semibold">Mis pedidos</h2>
      {loading && <p className="mt-6">Cargando…</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}
      {!loading && !error && (
        orders.length === 0 ? (
          <p className="mt-6">Aún no tienes pedidos.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4">
            {orders.map(o => (
              <button key={o.id} className="card p-4 flex items-center justify-between text-left" onClick={()=>navigate(`/order/${o.id}`, { state: { order: o } })}>
                <div>
                  <p className="font-medium">Orden #{o.id}</p>
                  <p className="text-neutral-600 text-sm">{new Date(o.created_at || o.createdAt || Date.now()).toLocaleString()}</p>
                  {o.estimatedDelivery && (
                    <p className="text-neutral-600 text-sm">Entrega estimada: {new Date(o.estimatedDelivery).toLocaleDateString()}</p>
                  )}
                  {Array.isArray(o.items) && o.items.length > 0 && (
                    <div className="mt-2 flex items-center gap-3 flex-wrap">
                      {o.items.slice(0, 2).map((it) => (
                        <div key={`${o.id}-${it.product_id}`} className="flex items-center gap-2">
                          {it.product_image_url && (
                            <img src={it.product_image_url} alt={it.product_name || `Producto #${it.product_id}`} className="w-9 h-9 object-cover rounded" />
                          )}
                          <span className="text-sm text-neutral-700 truncate max-w-[12rem]">
                            {it.product_name || `Producto #${it.product_id}`} <span className="text-neutral-500">x{it.quantity}</span>
                          </span>
                        </div>
                      ))}
                      {o.items.length > 2 && (
                        <span className="text-sm text-neutral-600">y +{o.items.length - 2} más</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">${Number(o.amount || o.total || 0).toFixed(2)}</p>
                  <p className="text-sm text-neutral-600">{(o.status || 'PENDIENTE')}</p>
                </div>
              </button>
            ))}
          </div>
        )
      )}
    </section>
  )
}