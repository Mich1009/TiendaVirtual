/** @param {import('knex')} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable('orders', (t) => {
    // Datos de envío
    t.string('shipping_name');
    t.string('shipping_phone');
    t.string('shipping_address1');
    t.string('shipping_address2');
    t.string('shipping_city');
    t.string('shipping_state');
    t.string('shipping_zip');
    t.string('shipping_country');
    // Datos de pago (solo resumen)
    t.string('card_brand');
    t.string('card_last4');
    // Fecha estimada de entrega
    t.date('estimated_delivery');
  });
};

/** @param {import('knex')} knex */
exports.down = async function down(knex) {
  await knex.schema.alterTable('orders', (t) => {
    t.dropColumn('shipping_name');
    t.dropColumn('shipping_phone');
    t.dropColumn('shipping_address1');
    t.dropColumn('shipping_address2');
    t.dropColumn('shipping_city');
    t.dropColumn('shipping_state');
    t.dropColumn('shipping_zip');
    t.dropColumn('shipping_country');
    t.dropColumn('card_brand');
    t.dropColumn('card_last4');
    t.dropColumn('estimated_delivery');
  });
};