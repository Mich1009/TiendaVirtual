#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de la aplicación...\n');

let hasErrors = false;

// Verificar package.json
console.log('✓ Verificando package.json...');
const packageJson = require('../package.json');
const requiredDeps = [
  'expo',
  'expo-router',
  'react-native',
  '@react-native-async-storage/async-storage',
  'base-64'
];

requiredDeps.forEach(dep => {
  if (!packageJson.dependencies[dep]) {
    console.log(`  ❌ Falta dependencia: ${dep}`);
    hasErrors = true;
  }
});

// Verificar app.json
console.log('✓ Verificando app.json...');
const appJson = require('../app.json');
if (!appJson.expo.extra || !appJson.expo.extra.API_URL) {
  console.log('  ⚠️  API_URL no configurada en app.json');
  console.log('  📝 Edita app.json y configura extra.API_URL con tu IP local');
} else {
  console.log(`  ✓ API_URL configurada: ${appJson.expo.extra.API_URL}`);
}

// Verificar archivos principales
console.log('✓ Verificando archivos principales...');
const requiredFiles = [
  'app/_layout.tsx',
  'app/index.tsx',
  'app/(tabs)/_layout.tsx',
  'app/(tabs)/catalog.tsx',
  'app/(tabs)/cart.tsx',
  'app/(tabs)/perfil.tsx',
  'app/login.tsx',
  'app/register.tsx',
  'app/checkout.tsx',
  'app/orders.tsx',
  'app/product/[id].tsx',
  'context/CartContext.tsx',
  'lib/api.ts',
  'lib/auth.ts',
  'constants/theme.ts'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.log(`  ❌ Archivo faltante: ${file}`);
    hasErrors = true;
  }
});

console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Se encontraron errores en la configuración');
  console.log('Por favor, corrige los errores antes de continuar');
  process.exit(1);
} else {
  console.log('✅ Configuración verificada correctamente');
  console.log('\n📱 Para iniciar la aplicación:');
  console.log('   npm start');
  console.log('\n📖 Lee INSTRUCCIONES.md para más información');
}
console.log('='.repeat(50) + '\n');
