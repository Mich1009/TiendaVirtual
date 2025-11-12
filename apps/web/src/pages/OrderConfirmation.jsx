import { useLocation, useNavigate, useParams } from 'react-router-dom'

export default function OrderConfirmation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const order = location.state?.order

  if (!order) {
    // Si no hay datos en estado, redirigir a pedidos
    navigate('/orders')
    return null
  }

  const eta = order.estimatedDelivery ? new Date(order.estimatedDelivery) : null
  const total = Number(order.total || 0)

  return (
    <section className="container py-8">
      <h2 className="text-2xl font-semibold">Pedido confirmado</h2>
      <p className="mt-2 text-neutral-700">Orden #{id}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-medium">Productos</h3>
          <div className="mt-4 flex flex-col gap-3">
            {order.items?.map(it => (
              <div key={`${it.order_id}-${it.product_id}`} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {it.product_image_url && (
                    <img src={it.product_image_url} alt={it.product_name || `Producto #${it.product_id}`} className="w-14 h-14 object-cover rounded" />
                  )}
                  <div>
                    <p className="font-medium">{it.product_name || `Producto #${it.product_id}`}</p>
                    <p className="text-sm text-neutral-600">Cantidad: {it.quantity}</p>
                  </div>
                </div>
                <p className="font-semibold">${Number(it.unit_price * it.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-medium">Resumen</h3>
          <p className="mt-2">Total pagado: <span className="font-semibold">${total.toFixed(2)}</span></p>
          <p className="mt-1">Estado: <span className="font-semibold">{order.status}</span></p>
          {order.payment?.last4 && (
            <p className="mt-1">Pago: {order.payment.brand || 'Tarjeta'} •••• {order.payment.last4}</p>
          )}
          {eta && (
            <p className="mt-2">Entrega estimada: <span className="font-semibold">{eta.toLocaleDateString()}</span></p>
          )}
          {order.shipping?.fullName && (
            <div className="mt-4 text-sm text-neutral-700">
              <p className="font-medium">Enviar a:</p>
              <p>{order.shipping.fullName}</p>
              <p>{order.shipping.address1} {order.shipping.address2}</p>
              <p>{order.shipping.city}, {order.shipping.state} {order.shipping.zip}</p>
              <p>{order.shipping.country}</p>
            </div>
          )}
          <button className="btn mt-6" onClick={() => navigate('/orders')}>Ver mis pedidos</button>
        </div>
      </div>
    </section>
  )
}