import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrdersAdmin, setOrderStatus } from '../lib/api.js'
import { getUser } from '../lib/auth.js'

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'PAID', label: 'Pagado' },
  { value: 'CANCELLED', label: 'Cancelado' }
]

export default function Admin() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const user = useMemo(() => getUser(), [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || !user || user.role !== 'ADMIN') {
      navigate('/login', { state: { from: '/admin' } })
      return
    }
    (async () => {
      try {
        setLoading(true)
        const data = await getOrdersAdmin(token, { page, limit })
        const list = Array.isArray(data.items) ? data.items : []
        setOrders(list)
        setTotal(Number(data.total || list.length))
      } catch (e) {
        setError(e.message || 'Error al cargar órdenes')
      } finally {
        setLoading(false)
      }
    })()
  }, [navigate, page, limit, user])

  async function changeStatus(id, next) {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const res = await setOrderStatus(token, id, next)
      setOrders(prev => prev.map(o => (o.id === id ? { ...o, status: res.status } : o)))
    } catch (e) {
      alert(e.message || 'No se pudo actualizar el estado')
    }
  }

  return (
    <section className="container py-8">
      <h2 className="text-2xl font-semibold">Panel administrador</h2>
      <p className="mt-2 text-neutral-700">Órdenes recientes</p>

      {loading && <p className="mt-6">Cargando…</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}

      {!loading && !error && (
        orders.length === 0 ? (
          <p className="mt-6">No hay órdenes.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4">
            {orders.map((o) => (
              <div key={o.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">Orden #{o.id}</p>
                  <p className="text-neutral-600 text-sm">Usuario #{o.user_id} • {new Date(o.created_at || o.createdAt || Date.now()).toLocaleString()}</p>
                  <p className="text-sm">Total: <span className="font-semibold">${Number(o.total || 0).toFixed(2)}</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={o.status || 'PENDING'}
                    onChange={(e) => changeStatus(o.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {!loading && total > limit && (
        <div className="mt-6 flex items-center gap-3">
          <button className="btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</button>
          <span className="text-sm text-neutral-700">Página {page}</span>
          <button className="btn" disabled={(page * limit) >= total} onClick={() => setPage(p => p + 1)}>Siguiente</button>
        </div>
      )}
    </section>
  )
}