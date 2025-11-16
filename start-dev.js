#!/usr/bin/env node

/**
 * Script para iniciar backend y frontend en terminales separadas
 * dentro del editor de código
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando Tienda Virtual...\n');

// Función para iniciar un proceso
function startProcess(name, command, cwd, color) {
  console.log(`${color}[${name}] Iniciando...${'\x1b[0m'}`);
  
  const proc = spawn(command, [], {
    cwd: path.join(__dirname, cwd),
    shell: true,
    stdio: 'inherit'
  });

  proc.on('error', (error) => {
    console.error(`${color}[${name}] Error: ${error.message}${'\x1b[0m'}`);
  });

  proc.on('exit', (code) => {
    if (code !== 0) {
      console.log(`${color}[${name}] Proceso terminado con código ${code}${'\x1b[0m'}`);
    }
  });

  return proc;
}

// Colores ANSI
const BLUE = '\x1b[34m';
const GREEN = '\x1b[32m';

// Iniciar backend
const backend = startProcess('Backend', 'npm start', 'backend/api', BLUE);

// Esperar 5 segundos antes de iniciar el frontend
setTimeout(() => {
  const frontend = startProcess('Frontend', 'npm start', 'frontend', GREEN);
  
  // Manejar Ctrl+C para cerrar ambos procesos
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Deteniendo aplicación...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });
}, 5000);

console.log('\n💡 Presiona Ctrl+C para detener ambos procesos\n');
