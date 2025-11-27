// Importar Knex para crear conexión a la BD
const Knex = require('knex');

// Importar Model de Objection.js (ORM que usa Knex)
const { Model } = require('objection');

// Importar configuración de Knex desde knexfile.js
const config = require('../../knexfile');

// Obtener el ambiente (development, production, test)
// Por defecto usa 'development'
const environment = process.env.NODE_ENV || 'development';

// Crear instancia de Knex con la configuración del ambiente actual
const knex = Knex(config[environment]);

// Conectar Objection.js con la instancia de Knex
// Esto permite usar Objection.js para queries más complejas
Model.knex(knex);

// Exportar la instancia de Knex para usarla en toda la aplicación
module.exports = knex;