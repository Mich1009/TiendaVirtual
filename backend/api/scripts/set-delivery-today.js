/**
 * Script para poner las fechas de entrega para HOY
 * Útil para testing rápido
 */

require('dotenv').config();
const knex = require('../src/db/knex');

async function setDeliveryToday() {
  try {
    console.log('🔄 Configurando entregas para HOY...');
    
    // Obtener todos los pedidos con estado PAID
    const orders = await knex('orders')
      .where('status', 'PAID')
      .select('id', 'created_at');
    
    console.log(`📦 Encontrados ${orders.length} pedidos para actualizar`);
    
    // Fecha de hoy a las 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Actualizar cada pedido
    for (const order of orders) {
      await knex('orders')
        .where('id', order.id)
        .update({ estimated_delivery: today });
      
      console.log(`✓ Pedido #${order.id}: ${today.toLocaleDateString('es-PE')} (HOY)`);
    }
    
    console.log('\n✅ Fechas actualizadas correctamente');
    console.log('💡 Los pedidos ahora deberían marcarse como ENTREGADOS');
    console.log('🔄 Espera 5 minutos o reinicia el backend para que el job los actualice');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setDeliveryToday();
