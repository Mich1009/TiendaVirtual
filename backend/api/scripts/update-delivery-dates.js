/**
 * Script para actualizar las fechas de entrega de pedidos existentes
 * Cambia las fechas a 1 día desde la fecha de creación
 */

require('dotenv').config();
const knex = require('../src/db/knex');

async function updateDeliveryDates() {
  try {
    console.log('🔄 Actualizando fechas de entrega...');
    
    // Obtener todos los pedidos con estado PAID
    const orders = await knex('orders')
      .where('status', 'PAID')
      .select('id', 'created_at');
    
    console.log(`📦 Encontrados ${orders.length} pedidos para actualizar`);
    
    // Actualizar cada pedido
    for (const order of orders) {
      const createdAt = new Date(order.created_at);
      // Nueva fecha: 1 día después de la creación
      const newEta = new Date(createdAt.getTime() + 1 * 24 * 60 * 60 * 1000);
      
      await knex('orders')
        .where('id', order.id)
        .update({ estimated_delivery: newEta });
      
      console.log(`✓ Pedido #${order.id}: ${newEta.toLocaleDateString('es-PE')}`);
    }
    
    console.log('\n✅ Fechas actualizadas correctamente');
    console.log('💡 Los pedidos ahora se entregarán 1 día después de su creación');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateDeliveryDates();
