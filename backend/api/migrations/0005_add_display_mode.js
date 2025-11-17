/**
 * Migración: Agregar display_mode a store_settings
 */

/** @param {import('knex')} knex */
exports.up = async function up(knex) {
  // Agregar el nuevo campo display_mode a la configuración
  const exists = await knex('store_settings').where({ key: 'display_mode' }).first();
  
  if (!exists) {
    await knex('store_settings').insert([
      { key: 'display_mode', value: 'both' }
    ]);
  }
};

/** @param {import('knex')} knex */
exports.down = async function down(knex) {
  // Eliminar el campo display_mode
  await knex('store_settings').where({ key: 'display_mode' }).del();
};