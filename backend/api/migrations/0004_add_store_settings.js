/**
 * Migración: Tabla de configuración de la tienda
 */

/** @param {import('knex')} knex */
exports.up = async function up(knex) {
  // Store Settings - configuración global de la tienda
  await knex.schema.createTable('store_settings', (t) => {
    t.increments('id').primary();
    t.string('key').notNullable().unique(); // 'store_name', 'store_logo', 'font_family'
    t.text('value'); // valor de la configuración
    t.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Insertar valores por defecto
  await knex('store_settings').insert([
    { key: 'store_name', value: 'Tienda' },
    { key: 'store_logo', value: null },
    { key: 'font_family', value: 'System' }
  ]);
};

/** @param {import('knex')} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('store_settings');
};
