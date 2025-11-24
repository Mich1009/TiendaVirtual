/**
 * Job para actualizar pedidos a estado DELIVERED
 * cuando se cumple la fecha estimada de entrega
 */

const Order = require('../models/Order');

async function updateDeliveredOrders() {
  try {
    const now = new Date();
    
    // Obtener solo la fecha (sin horas) de hoy
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Buscar pedidos pagados cuya fecha de entrega ya pasó
    // Solo se marcan como entregados DESPUÉS de la fecha estimada
    const ordersToUpdate = await Order.query()
      .where('status', 'PAID')
      .where('estimated_delivery', '<', today)
      .whereNotNull('estimated_delivery');
    
    if (ordersToUpdate.length === 0) {
      console.log('✓ No hay pedidos para actualizar a DELIVERED');
      return;
    }
    
    // Actualizar cada pedido a DELIVERED
    for (const order of ordersToUpdate) {
      await Order.query()
        .findById(order.id)
        .patch({ status: 'DELIVERED' });
      
      console.log(`✓ Pedido #${order.id} actualizado a DELIVERED`);
    }
    
    console.log(`✓ ${ordersToUpdate.length} pedido(s) actualizado(s) a DELIVERED`);
  } catch (error) {
    console.error('Error actualizando pedidos a DELIVERED:', error);
  }
}

module.exports = { updateDeliveredOrders };
