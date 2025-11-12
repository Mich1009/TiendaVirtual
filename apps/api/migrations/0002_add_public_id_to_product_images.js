/** @param {import('knex')} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable('product_images', (t) => {
    t.string('public_id');
  });
};

/** @param {import('knex')} knex */
exports.down = async function down(knex) {
  await knex.schema.alterTable('product_images', (t) => {
    t.dropColumn('public_id');
  });
};