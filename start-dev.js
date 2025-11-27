#!/usr/bin/env node

/**
 * Script para iniciar backend y frontend sin túnel
 * Ejecuta migraciones y seeder automáticamente
 * Usa conexión directa con IP local para mejor rendimiento
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando Tienda Virtual...\n');

const processes = [];

// Colores ANSI
const BLUE = '\x1b[34m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

// Función para ejecutar comandos secuencialmente
function executeCommand(name, command, args, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`${YELLOW}[${name}] Ejecutando...${RESET}`);
    
    const proc = spawn(command, args, {
      cwd: cwd ? path.join(__dirname, cwd) : __dirname,
      shell: true,
      stdio: 'inherit'
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        console.error(`${YELLOW}[${name}] Error (código: ${code})${RESET}`);
        reject(new Error(`${name} falló`));
      } else {
        console.log(`${YELLOW}[${name}] ✅ Completado${RESET}\n`);
        resolve();
      }
    });

    proc.on('error', (error) => {
      console.error(`${YELLOW}[${name}] Error: ${error.message}${RESET}`);
      reject(error);
    });
  });
}

// Función para iniciar un proceso (sin esperar)
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

// Manejar Ctrl+C para cerrar todos los procesos
function cleanup() {
  console.log('\n\n🛑 Deteniendo aplicación...');
  processes.forEach(proc => {
    try {
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

// Ejecutar setup de BD y luego iniciar servidores
async function main() {
  try {
    // Paso 1: Ejecutar migraciones
    await executeCommand('Migraciones', 'npm', ['run', 'migrate'], 'backend/api');
    
    // Paso 2: Ejecutar seeder
    await executeCommand('Seeder', 'npm', ['run', 'seed'], 'backend/api');
    
    // Paso 3: Iniciar backend
    console.log(`${BLUE}[3/4] Iniciando Backend...${RESET}`);
    startProcess('Backend', 'npm', ['run', 'dev'], 'backend/api', BLUE);

    // Paso 4: Esperar 3 segundos e iniciar frontend
    setTimeout(() => {
      console.log(`\n${GREEN}[4/4] Iniciando Frontend (LAN)...${RESET}\n`);
      startProcess('Frontend', 'npx', ['expo', 'start', '--lan'], 'frontend', GREEN);
    }, 3000);
  } catch (error) {
    console.error(`\n❌ Error durante la configuración: ${error.message}`);
    process.exit(1);
  }
}

main();
