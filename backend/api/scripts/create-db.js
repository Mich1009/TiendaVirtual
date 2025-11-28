#!/usr/bin/env node

const { Client } = require('pg');

async function main() {
  const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:admin1009@localhost:5432/tiendavirtual';
  const url = new URL(dbUrl);
  const dbName = url.pathname.replace('/', '') || 'tiendavirtual';
  
  url.pathname = '/postgres';
  const client = new Client({ connectionString: url.toString() });
  
  try {
    await client.connect();
    const exists = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    
    if (exists.rowCount > 0) {
      console.log(`✓ Base de datos '${dbName}' ya existe`);
      return;
    }
    
    await client.query(`CREATE DATABASE ${dbName}`);
    console.log(`✓ Base de datos '${dbName}' creada`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();