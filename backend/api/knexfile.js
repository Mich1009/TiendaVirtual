require('dotenv').config();

const DEFAULT_DATABASE = {
  host: process.env.PGHOST || '127.0.0.1',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || undefined,
  database: process.env.PGDATABASE || 'tiendavirtual',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432
};

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || DEFAULT_DATABASE,
    pool: { 
      min: 1, 
      max: 5,
      acquireTimeoutMillis: 3000,
      idleTimeoutMillis: 30000
    },
    acquireConnectionTimeout: 3000,
    migrations: { tableName: 'knex_migrations', directory: './migrations' },
    seeds: { directory: './seeds' }
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: { min: 2, max: 10 },
    migrations: { tableName: 'knex_migrations', directory: './migrations' },
    seeds: { directory: './seeds' }
  }
};