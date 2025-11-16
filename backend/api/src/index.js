require('dotenv').config();
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const app = require('./app');

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

// Función para inicializar la base de datos
async function initializeDatabase() {
  try {
    console.log('🔍 Verificando base de datos...');
    
    // Intentar crear la base de datos si no existe
    await execAsync('node scripts/create-db.js');
    
    // Ejecutar migraciones
    console.log('📦 Ejecutando migraciones...');
    await execAsync('npx knex migrate:latest');
    console.log('✓ Migraciones completadas');
    
    // Verificar si hay datos (usuarios)
    const knex = require('./db/knex');
    const userCount = await knex('users').count('* as count').first();
    
    if (parseInt(userCount.count) === 0) {
      console.log('🌱 Poblando base de datos con datos iniciales...');
      await execAsync('npx knex seed:run');
      console.log('✓ Datos iniciales creados');
    } else {
      console.log('✓ Base de datos ya tiene datos');
    }
    
    console.log('✓ Base de datos lista');
  } catch (error) {
    console.error('⚠ Error inicializando base de datos:', error.message);
    console.log('→ Continuando de todos modos...');
  }
}

// Iniciar servidor inmediatamente
const server = app.listen(PORT, HOST, async () => {
  console.log(`API escuchando en http://${HOST}:${PORT}`);
  
  // Inicializar base de datos en segundo plano
  setTimeout(async () => {
    try {
      await initializeDatabase();
      require('./db/knex');
      
      // Iniciar job para actualizar pedidos entregados
      const { updateDeliveredOrders } = require('./jobs/update-delivered-orders');
      
      // Ejecutar inmediatamente
      await updateDeliveredOrders();
      
      // MODO PRUEBA: Ejecutar cada 5 minutos para testing con entrega en 1 día
      setInterval(async () => {
        await updateDeliveredOrders();
      }, 300000); // 5 minutos
      
      console.log('✓ Job de actualización de pedidos iniciado (cada 5 minutos - MODO PRUEBA)');
      
      // MODO PRODUCCIÓN: Descomentar para ejecutar cada hora
      // setInterval(async () => {
      //   await updateDeliveredOrders();
      // }, 3600000); // 1 hora
      // console.log('✓ Job de actualización de pedidos iniciado (cada hora)');
    } catch (error) {
      console.error('✗ Error:', error.message);
    }
  }, 100);
});