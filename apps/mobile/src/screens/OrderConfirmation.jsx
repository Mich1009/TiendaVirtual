import { SafeAreaView, View, Text, Image, FlatList } from 'react-native'

export default function OrderConfirmation({ route, navigation }) {
  const { order } = route.params || {}
  if (!order) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text>No hay datos de la orden.</Text>
    </SafeAreaView>
  )

  const total = Number(order.total || 0)
  const eta = order.estimatedDelivery ? new Date(order.estimatedDelivery) : null

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-4">
        <Text className="text-2xl font-bold">Pedido confirmado</Text>
        <Text className="text-neutral-700 mt-1">Orden #{order.id}</Text>
      </View>
      <FlatList
        data={order.items || []}
        keyExtractor={(it, idx) => String(idx)}
        renderItem={({ item: it }) => (
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-neutral-100">
            <View className="flex-row items-center gap-3">
              {it.product_image_url ? (
                <Image source={{ uri: it.product_image_url }} style={{ width: 56, height: 56, borderRadius: 8 }} />
              ) : (
                <View className="w-14 h-14 bg-neutral-100 items-center justify-center rounded"><Text className="text-neutral-500">No img</Text></View>
              )}
              <View>
                <Text className="font-medium" numberOfLines={1}>{it.product_name || `Producto #${it.product_id}`}</Text>
                <Text className="text-sm text-neutral-600">Cantidad: {it.quantity}</Text>
              </View>
            </View>
            <Text className="font-semibold">${Number(it.unit_price * it.quantity).toFixed(2)}</Text>
          </View>
        )}
        ListFooterComponent={() => (
          <View className="px-4 py-6">
            <Text className="text-lg">Resumen</Text>
            <Text className="mt-2">Total pagado: <Text className="font-semibold">${total.toFixed(2)}</Text></Text>
            <Text className="mt-1">Estado: <Text className="font-semibold">{order.status}</Text></Text>
            {order.payment?.last4 && (
              <Text className="mt-1">Pago: {order.payment.brand || 'Tarjeta'} •••• {order.payment.last4}</Text>
            )}
            {eta && (
              <Text className="mt-2">Entrega estimada: <Text className="font-semibold">{eta.toLocaleDateString()}</Text></Text>
            )}
            {order.shipping?.fullName && (
              <View className="mt-4">
                <Text className="font-medium">Enviar a:</Text>
                <Text>{order.shipping.fullName}</Text>
                <Text>{order.shipping.address1} {order.shipping.address2}</Text>
                <Text>{order.shipping.city}, {order.shipping.state} {order.shipping.zip}</Text>
                <Text>{order.shipping.country}</Text>
              </View>
            )}
            <View className="mt-6">
              <Text onPress={() => navigation.getParent()?.navigate('Mis pedidos')} className="rounded-md px-4 py-3 bg-brand text-white text-center">Ver mis pedidos</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  )
}