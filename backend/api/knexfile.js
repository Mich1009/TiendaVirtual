require('dotenv').config();

const DEFAULT_DATABASE_URL = 'postgres://postgres:admin1009@localhost:5432/tiendavirtual';

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
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