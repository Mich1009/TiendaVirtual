// Cargar variables de entorno desde archivo .env
require('dotenv').config();

// Importar módulos para ejecutar comandos del sistema
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec); // Convertir exec a promesa para usar async/await

// Importar la aplicación Express configurada
const app = require('./app');

// Obtener puerto y host desde variables de entorno, con valores por defecto
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

/**
 * Función para inicializar la base de datos
 * - Crea la BD si no existe
 * - Ejecuta migraciones para crear tablas
 * - Carga datos iniciales si la BD está vacía
 */
async function initializeDatabase() {
  try {
    console.log('🔍 Verificando base de datos...');
    
    // Ejecutar script que crea la base de datos si no existe
    await execAsync('node scripts/create-db.js');
    
    // Ejecutar todas las migraciones pendientes
    console.log('📦 Ejecutando migraciones...');
    await execAsync('npx knex migrate:latest');
    console.log('✓ Migraciones completadas');
    
    // Conectar a la BD y contar usuarios existentes
    const knex = require('./db/knex');
    const userCount = await knex('users').count('* as count').first();
    
    // Si no hay usuarios, ejecutar el seeder para cargar datos de prueba
    if (parseInt(userCount.count) === 0) {
      console.log('🌱 Poblando base de datos con datos iniciales...');
      await execAsync('npx knex seed:run');
      console.log('✓ Datos iniciales creados');
    } else {
      console.log('✓ Base de datos ya tiene datos');
    }
    
    console.log('✓ Base de datos lista');
  } catch (error) {
    // Si hay error, mostrar advertencia pero continuar (la BD podría estar ya lista)
    console.error('⚠ Error inicializando base de datos:', error.message);
    console.log('→ Continuando de todos modos...');
  }
}

// Iniciar el servidor Express en el puerto y host especificados
const server = app.listen(PORT, HOST, async () => {
  console.log(`API escuchando en http://${HOST}:${PORT}`);
  
  // Ejecutar inicialización de BD después de 100ms (en segundo plano)
  setTimeout(async () => {
    try {
      // Inicializar la base de datos
      await initializeDatabase();
      require('./db/knex');
      
      // Importar el job que actualiza pedidos entregados
      const { updateDeliveredOrders } = require('./jobs/update-delivered-orders');
      
      // Ejecutar el job inmediatamente la primera vez
      await updateDeliveredOrders();
      
      // MODO PRUEBA: Ejecutar cada 5 minutos para testing rápido
      setInterval(async () => {
        await updateDeliveredOrders();
      }, 300000); // 300000 ms = 5 minutos
      
      console.log('✓ Job de actualización de pedidos iniciado (cada 5 minutos - MODO PRUEBA)');
      
      // MODO PRODUCCIÓN: Descomentar para ejecutar cada hora en lugar de cada 5 minutos
      // setInterval(async () => {
      //   await updateDeliveredOrders();
      // }, 3600000); // 3600000 ms = 1 hora
      // console.log('✓ Job de actualización de pedidos iniciado (cada hora)');
    } catch (error) {
      console.error('✗ Error:', error.message);
    }
  }, 100);
});