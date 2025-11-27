#!/usr/bin/env node

/**
 * Script para configurar la base de datos
 * Ejecuta migraciones y luego el seeder en secuencia
 * 
 * Uso: npm run db:setup
 * 
 * Este script es útil para:
 * - Configurar la BD desde cero
 * - Cargar datos de prueba iniciales
 * - Resetear la BD a su estado inicial
 */

// Importar módulo para ejecutar comandos del sistema
const { spawn } = require('child_process');
const path = require('path');

// Array de comandos a ejecutar en orden
// Cada comando tiene un nombre, comando npm y argumentos
const commands = [
  { name: 'Migraciones', cmd: 'npm', args: ['run', 'migrate'] },  // Crea las tablas
  { name: 'Seeder', cmd: 'npm', args: ['run', 'seed'] }            // Carga datos de prueba
];

// Índice para rastrear qué comando se está ejecutando
let currentIndex = 0;

/**
 * Ejecuta comandos secuencialmente
 * Espera a que uno termine antes de ejecutar el siguiente
 */
function executeCommand() {
  // Si ya ejecutamos todos los comandos, terminar
  if (currentIndex >= commands.length) {
    console.log('\n✅ Base de datos configurada correctamente\n');
    process.exit(0);
  }

  // Obtener el comando actual del array
  const { name, cmd, args } = commands[currentIndex];
  console.log(`\n📦 Ejecutando: ${name}...\n`);

  // Ejecutar el comando npm en la carpeta backend/api
  const proc = spawn(cmd, args, {
    cwd: __dirname.replace(/scripts$/, ''),  // Cambiar a carpeta padre (backend/api)
    shell: true,                              // Usar shell para ejecutar comandos npm
    stdio: 'inherit'                          // Mostrar output en consola
  });

  // Cuando el proceso termina
  proc.on('close', (code) => {
    // Si hay error (código != 0), detener
    if (code !== 0) {
      console.error(`\n❌ Error en ${name}`);
      process.exit(1);
    }
    // Si fue exitoso, ejecutar el siguiente comando
    currentIndex++;
    executeCommand();
  });

  // Si hay error al ejecutar el comando
  proc.on('error', (error) => {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  });
}

// Mostrar mensaje inicial y comenzar a ejecutar comandos
console.log('🚀 Configurando base de datos...\n');
executeCommand();
