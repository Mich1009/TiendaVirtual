#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Configurando base de datos...\n');

try {
  console.log('📦 Ejecutando migraciones...');
  execSync('npm run migrate', { stdio: 'inherit' });
  
  console.log('\n🌱 Cargando datos iniciales...');
  execSync('npm run seed', { stdio: 'inherit' });
  
  console.log('\n✅ Base de datos configurada correctamente\n');
} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}
