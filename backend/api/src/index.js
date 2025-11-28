require('dotenv').config();
const { execSync } = require('child_process');
const app = require('./app');

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

async function initDb() {
  try {
    console.log('🔍 Verificando base de datos...');
    execSync('node scripts/create-db.js', { stdio: 'inherit' });
    execSync('npx knex migrate:latest', { stdio: 'inherit' });
    
    const knex = require('./db/knex');
    const count = await knex('users').count('* as count').first();
    
    if (parseInt(count.count) === 0) {
      console.log('🌱 Cargando datos iniciales...');
      execSync('npx knex seed:run', { stdio: 'inherit' });
    }
    console.log('✓ Base de datos lista\n');
  } catch (error) {
    console.error('⚠ Error BD:', error.message);
  }
}

app.listen(PORT, HOST, async () => {
  console.log(`🚀 API en http://${HOST}:${PORT}\n`);
  
  setTimeout(async () => {
    await initDb();
    
    try {
      const { updateDeliveredOrders } = require('./jobs/update-delivered-orders');
      await updateDeliveredOrders();
      setInterval(updateDeliveredOrders, 300000);
      console.log('✓ Job de pedidos iniciado\n');
    } catch (e) {
      console.error('Error job:', e.message);
    }
  }, 100);
});