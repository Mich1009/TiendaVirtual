#!/usr/bin/env node

/**
 * Script para iniciar backend y frontend con túnel de Expo
 * El túnel permite acceso desde cualquier dispositivo sin importar la red WiFi
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando Tienda Virtual con Túnel de Expo...\n');

const processes = [];

// Colores ANSI
const BLUE = '\x1b[34m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

// Función para iniciar un proceso
function startProcess(name, command, args, cwd, color) {
  console.log(`${color}[${name}] Iniciando...${RESET}\n`);
  
  const proc = spawn(command, args, {
    cwd: cwd ? path.join(__dirname, cwd) : __dirname,
    shell: true,
    stdio: 'inherit'
  });

  proc.on('error', (error) => {
    console.error(`${color}[${name}] Error: ${error.message}${RESET}`);
  });

  processes.push(proc);
  return proc;
}

// Paso 1: Iniciar backend
console.log(`${BLUE}[1/2] Iniciando Backend...${RESET}`);
startProcess('Backend', 'npm', ['run', 'dev'], 'backend/api', BLUE);

// Paso 2: Esperar 5 segundos e iniciar frontend con túnel
setTimeout(() => {
  console.log(`\n${GREEN}[2/2] Iniciando Frontend con Túnel de Expo...${RESET}`);
  console.log(`${GREEN}Esto puede tardar un momento la primera vez...${RESET}\n`);
  
  startProcess('Frontend', 'npx', ['expo', 'start', '--tunnel'], 'frontend', GREEN);
  
  setTimeout(() => {
  }, 5000);
}, 5000);

// Manejar Ctrl+C para cerrar todos los procesos
function cleanup() {
  console.log('\n\n🛑 Deteniendo aplicación...');
  processes.forEach(proc => {
    try {
      // En Windows, usar taskkill para forzar el cierre
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', proc.pid, '/f', '/t'], { shell: true });
      } else {
        proc.kill('SIGTERM');
      }
    } catch (e) {
      console.error('Error al detener proceso:', e.message);
    }
  });
  
  setTimeout(() => {
    console.log('✅ Procesos detenidos');
    process.exit(0);
  }, 1000);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
