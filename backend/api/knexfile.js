// Cargar variables de entorno desde archivo .env
require('dotenv').config();

// ============ CONFIGURACIÓN POR DEFECTO DE LA BD ============
// Se usa si no hay DATABASE_URL en variables de entorno
const DEFAULT_DATABASE = {
  host: process.env.PGHOST || '127.0.0.1',      // Host de PostgreSQL
  user: process.env.PGUSER || 'postgres',        // Usuario de BD
  password: process.env.PGPASSWORD || undefined, // Contraseña de BD
  database: process.env.PGDATABASE || 'tiendavirtual', // Nombre de la BD
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432 // Puerto de PostgreSQL
};

// ============ CONFIGURACIÓN DE KNEX POR AMBIENTE ============
module.exports = {
  // ===== DESARROLLO =====
  development: {
    client: 'pg',                                    // Usar PostgreSQL
    connection: process.env.DATABASE_URL || DEFAULT_DATABASE, // URL o config por defecto
    pool: { 
      min: 1,                                        // Mínimo de conexiones en pool
      max: 5,                                        // Máximo de conexiones en pool
      acquireTimeoutMillis: 3000,                   // Timeout para obtener conexión (3s)
      idleTimeoutMillis: 30000                      // Timeout para conexión inactiva (30s)
    },
    acquireConnectionTimeout: 3000,                 // Timeout para adquirir conexión
    migrations: { 
      tableName: 'knex_migrations',                 // Tabla donde se guardan migraciones
      directory: './migrations'                     // Carpeta de migraciones
    },
    seeds: { 
      directory: './seeds'                          // Carpeta de seeders
    }
  },
  
  // ===== PRODUCCIÓN =====
  production: {
    client: 'pg',                                    // Usar PostgreSQL
    connection: process.env.DATABASE_URL,           // URL de BD desde variable de entorno
    pool: { 
      min: 2,                                        // Más conexiones en producción
      max: 10                                        // Máximo de conexiones
    },
    migrations: { 
      tableName: 'knex_migrations',
      directory: './migrations'
    },
    seeds: { 
      directory: './seeds'
    }
  }
};