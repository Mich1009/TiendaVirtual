#!/usr/bin/env node

/**
 * Script para iniciar backend y frontend sin túnel
 * 
 * Uso: npm start
 * 
 * Qué hace:
 * 1. Ejecuta migraciones automáticamente (crea tablas si no existen)
 * 2. Inicia el backend en puerto 4000
 * 3. Inicia el frontend en puerto 8081 con conexión LAN
 * 
 * Nota: El seeder (datos de prueba) se ejecuta manualmente con:
 *       cd backend/api && npm run seed
 *       O usa: npm run db:setup (para migraciones + seeder)
 */

// Importar módulo para ejecutar comandos del sistema
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando Tienda Virtual...\n');

// Array para almacenar referencias a los procesos iniciados
const processes = [];

// ============ COLORES PARA CONSOLA ============
// Códigos ANSI para colorear el output en la terminal
const BLUE = '\x1b[34m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

/**
 * Ejecuta un comando y espera a que termine
 * Retorna una promesa que se resuelve cuando el comando termina
 * 
 * @param {string} name - Nombre del comando (para mostrar en logs)
 * @param {string} command - Comando a ejecutar (ej: 'npm')
 * @param {array} args - Argumentos del comando (ej: ['run', 'migrate'])
 * @param {string} cwd - Carpeta donde ejecutar el comando
 * @returns {Promise} Promesa que se resuelve cuando termina
 */
function executeCommand(name, command, args, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`${YELLOW}[${name}] Ejecutando...${RESET}`);
    
    // Ejecutar el comando en la carpeta especificada
    const proc = spawn(command, args, {
      cwd: cwd ? path.join(__dirname, cwd) : __dirname,
      shell: true,
      stdio: 'inherit'  // Mostrar output en consola
    });

    // Cuando el proceso termina
    proc.on('close', (code) => {
      // Si hay error (código != 0), rechazar la promesa
      if (code !== 0) {
        console.error(`${YELLOW}[${name}] Error (código: ${code})${RESET}`);
        reject(new Error(`${name} falló`));
      } else {
        // Si fue exitoso, resolver la promesa
        console.log(`${YELLOW}[${name}] ✅ Completado${RESET}\n`);
        resolve();
      }
    });

    // Si hay error al ejecutar el comando
    proc.on('error', (error) => {
      console.error(`${YELLOW}[${name}] Error: ${error.message}${RESET}`);
      reject(error);
    });
  });
}

/**
 * Inicia un proceso sin esperar a que termine
 * Se usa para backend y frontend que deben correr continuamente
 * 
 * @param {string} name - Nombre del proceso
 * @param {string} command - Comando a ejecutar
 * @param {array} args - Argumentos del comando
 * @param {string} cwd - Carpeta donde ejecutar
 * @param {string} color - Color ANSI para los logs
 */
function startProcess(name, command, args, cwd, color) {
  console.log(`${color}[${name}] Iniciando...${RESET}\n`);
  
  // Ejecutar el comando
  const proc = spawn(command, args, {
    cwd: cwd ? path.join(__dirname, cwd) : __dirname,
    shell: true,
    stdio: 'inherit'  // Mostrar output en consola
  });

  // Si hay error al ejecutar
  proc.on('error', (error) => {
    console.error(`${color}[${name}] Error: ${error.message}${RESET}`);
  });

  // Guardar referencia al proceso para poder cerrarlo después
  processes.push(proc);
  return proc;
}

/**
 * Limpia y cierra todos los procesos cuando se presiona Ctrl+C
 * Asegura que backend y frontend se cierren correctamente
 */
function cleanup() {
  console.log('\n\n🛑 Deteniendo aplicación...');
  
  // Cerrar cada proceso
  processes.forEach(proc => {
    try {
      if (process.platform === 'win32') {
        // En Windows, usar taskkill para forzar cierre
        spawn('taskkill', ['/pid', proc.pid, '/f', '/t'], { shell: true });
      } else {
        // En Linux/Mac, enviar señal SIGTERM
        proc.kill('SIGTERM');
      }
    } catch (e) {
      console.error('Error al detener proceso:', e.message);
    }
  });
  
  // Esperar 1 segundo y salir
  setTimeout(() => {
    console.log('✅ Procesos detenidos');
    process.exit(0);
  }, 1000);
}

// ============ MANEJADORES DE SEÑALES ============
// Ejecutar cleanup cuando se presiona Ctrl+C o se cierra la terminal
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

/**
 * Función principal
 * Ejecuta migraciones y luego inicia backend y frontend
 */
async function main() {
  try {
    // ============ PASO 1: EJECUTAR MIGRACIONES ============
    // Crea las tablas en la BD si no existen
    await executeCommand('Migraciones', 'npm', ['run', 'migrate'], 'backend/api');
    
    // ============ PASO 2: INICIAR BACKEND ============
    // Inicia el servidor Express en puerto 4000
    console.log(`${BLUE}[2/3] Iniciando Backend...${RESET}`);
    startProcess('Backend', 'npm', ['run', 'dev'], 'backend/api', BLUE);

    // ============ PASO 3: INICIAR FRONTEND ============
    // Esperar 3 segundos para que el backend esté listo
    setTimeout(() => {
      console.log(`\n${GREEN}[3/3] Iniciando Frontend (LAN)...${RESET}\n`);
      // Inicia Expo con conexión LAN (sin túnel)
      startProcess('Frontend', 'npx', ['expo', 'start', '--lan'], 'frontend', GREEN);
    }, 3000);
  } catch (error) {
    console.error(`\n❌ Error durante la configuración: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar la función principal
main();
