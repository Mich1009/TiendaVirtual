#!/usr/bin/env node

/**
 * Script para configurar la base de datos
 * Ejecuta migraciones y luego el seeder
 */

const { spawn } = require('child_process');
const path = require('path');

const commands = [
  { name: 'Migraciones', cmd: 'npm', args: ['run', 'migrate'] },
  { name: 'Seeder', cmd: 'npm', args: ['run', 'seed'] }
];

let currentIndex = 0;

function executeCommand() {
  if (currentIndex >= commands.length) {
    console.log('\n✅ Base de datos configurada correctamente\n');
    process.exit(0);
  }

  const { name, cmd, args } = commands[currentIndex];
  console.log(`\n📦 Ejecutando: ${name}...\n`);

  const proc = spawn(cmd, args, {
    cwd: __dirname.replace(/scripts$/, ''),
    shell: true,
    stdio: 'inherit'
  });

  proc.on('close', (code) => {
    if (code !== 0) {
      console.error(`\n❌ Error en ${name}`);
      process.exit(1);
    }
    currentIndex++;
    executeCommand();
  });

  proc.on('error', (error) => {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  });
}

console.log('🚀 Configurando base de datos...\n');
executeCommand();
