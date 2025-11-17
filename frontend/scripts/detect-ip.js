#!/usr/bin/env node

/**
 * Script para detectar la IP local y actualizar app.json automáticamente
 * 
 * Este script:
 * 1. Detecta la IP local de la máquina
 * 2. Actualiza app.json con la IP correcta
 * 3. Verifica que el backend esté accesible
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Obtener todas las interfaces de red
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Ignorar direcciones internas y no IPv4
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({
          name,
          address: iface.address
        });
      }
    }
  }

  return addresses;
}

// Verificar si el backend está accesible
function checkBackend(ip, port = 4000) {
  return new Promise((resolve) => {
    const options = {
      hostname: ip,
      port: port,
      path: '/v1/products',
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 404);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Actualizar app.json con la IP
function updateAppJson(ip) {
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  appJson.expo.extra = appJson.expo.extra || {};
  // Web usa localhost, móvil usa la IP detectada
  appJson.expo.extra.API_URL = 'http://localhost:4000/v1';
  appJson.expo.extra.API_URL_MOBILE = `http://${ip}:4000/v1`;
  
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  console.log(`✅ app.json actualizado:`);
  console.log(`   Web: localhost:4000`);
  console.log(`   Móvil: ${ip}:4000`);
}

// Función principal
async function main() {
  console.log('🔍 Detectando IP local...\n');
  
  const addresses = getLocalIP();
  
  if (addresses.length === 0) {
    console.log('❌ No se encontró ninguna IP local');
    console.log('   Asegúrate de estar conectado a una red WiFi');
    process.exit(1);
  }

  console.log('📡 IPs encontradas:');
  addresses.forEach((addr, index) => {
    console.log(`   ${index + 1}. ${addr.address} (${addr.name})`);
  });

  console.log('\n🔍 Verificando acceso al backend...\n');

  // Verificar cada IP
  for (const addr of addresses) {
    const isAccessible = await checkBackend(addr.address);
    if (isAccessible) {
      console.log(`✅ Backend accesible en: ${addr.address}:4000`);
      updateAppJson(addr.address);
      console.log('\n✨ Configuración completada!');
      console.log('   Ahora puedes ejecutar: npm start');
      return;
    } else {
      console.log(`❌ Backend NO accesible en: ${addr.address}:4000`);
    }
  }

  // Si ninguna IP funciona, usar la primera
  console.log('\n⚠️  No se pudo verificar el backend en ninguna IP');
  console.log('   Usando la primera IP encontrada: ' + addresses[0].address);
  updateAppJson(addresses[0].address);
  
  console.log('\n📝 Instrucciones:');
  console.log('   1. Asegúrate de que el backend esté ejecutándose');
  console.log('   2. Verifica que tu dispositivo esté en la misma red WiFi');
  console.log('   3. Ejecuta: npm start');
}

main().catch(console.error);
