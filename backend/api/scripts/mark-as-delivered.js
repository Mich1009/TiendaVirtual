/**
 * Script para marcar pedidos como DELIVERED manualmente
 */

require('dotenv').config();
const knex = require('../src/db/knex');

async function markAsDelivered() {
  try {
    console.log('🔄 Marcando pedidos como DELIVERED...');
    
    const now = new Date();
    
    // Obtener solo la fecha (sin horas) de hoy
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Buscar pedidos pagados cuya fecha de entrega ya pasó
    // Solo se marcan como entregados DESPUÉS de la fecha estimada
    const ordersToUpdate = await knex('orders')
      .where('status', 'PAID')
      .where('estimated_delivery', '<', today)
      .whereNotNull('estimated_delivery');
    
    console.log(`📦 Encontrados ${ordersToUpdate.length} pedidos para marcar como entregados`);
    
    if (ordersToUpdate.length === 0) {
      console.log('✓ No hay pedidos para actualizar');
      process.exit(0);
      return;
    }
    
    // Actualizar cada pedido a DELIVERED
    for (const order of ordersToUpdate) {
      await knex('orders')
        .where('id', order.id)
        .update({ status: 'DELIVERED' });
      
      const deliveryDate = new Date(order.estimated_delivery);
      console.log(`✓ Pedido #${order.id} → DELIVERED (entrega: ${deliveryDate.toLocaleDateString('es-PE')})`);
    }
    
    console.log(`\n✅ ${ordersToUpdate.length} pedido(s) actualizado(s) a DELIVERED`);
    console.log('🔄 Recarga la app para ver los cambios');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

markAsDelivered();
