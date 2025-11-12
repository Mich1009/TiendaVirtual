/*
  Crea la base de datos definida en DATABASE_URL si no existe.
  Se conecta al DB "postgres" y ejecuta CREATE DATABASE.
*/
const { Client } = require('pg');

function getTargetDb() {
  const defaultUrl = 'postgres://postgres:admin1009@localhost:5432/tiendavirtual';
  const urlStr = process.env.DATABASE_URL || defaultUrl;
  const url = new URL(urlStr);
  return url.pathname.replace('/', '') || 'tiendavirtual';
}

function getAdminUrl() {
  const defaultUrl = 'postgres://postgres:admin1009@localhost:5432/tiendavirtual';
  const urlStr = process.env.DATABASE_URL || defaultUrl;
  const url = new URL(urlStr);
  // Conectar a la DB de administración "postgres"
  url.pathname = '/postgres';
  return url.toString();
}

async function main() {
  const targetDb = getTargetDb();
  const adminUrl = getAdminUrl();
  const client = new Client({ connectionString: adminUrl });
  try {
    await client.connect();
    // Verifica si existe
    const existsRes = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [targetDb]);
    if (existsRes.rowCount > 0) {
      console.log(`La base de datos '${targetDb}' ya existe.`);
      return;
    }
    await client.query(`CREATE DATABASE ${targetDb}`);
    console.log(`Base de datos '${targetDb}' creada exitosamente.`);
  } catch (err) {
    console.error('Error creando la base de datos:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();