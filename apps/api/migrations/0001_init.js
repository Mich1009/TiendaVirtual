/**
 * Migración inicial: crea tablas base
 */

/** @param {import('knex')} knex */
exports.up = async function up(knex) {
  // Users
  await knex.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.string('email').notNullable().unique();
    t.string('password_hash').notNullable();
    t.string('role').notNullable().defaultTo('CUSTOMER'); // ADMIN | CUSTOMER
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Categories
  await knex.schema.createTable('categories', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.string('slug').notNullable().unique();
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Products
  await knex.schema.createTable('products', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.text('description');
    t.decimal('price', 10, 2).notNullable();
    t.integer('stock').notNullable().defaultTo(0);
    t.boolean('active').notNullable().defaultTo(true);
    t.integer('category_id').references('id').inTable('categories').onDelete('SET NULL');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Product Images
  await knex.schema.createTable('product_images', (t) => {
    t.increments('id').primary();
    t.integer('product_id').references('id').inTable('products').onDelete('CASCADE');
    t.text('url').notNullable();
    t.string('alt');
  });

  // Orders
  await knex.schema.createTable('orders', (t) => {
    t.increments('id').primary();
    t.integer('user_id').references('id').inTable('users').onDelete('SET NULL');
    t.decimal('total', 10, 2).notNullable();
    t.string('status').notNullable().defaultTo('PENDING'); // PENDING | PAID | CANCELLED
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Order Items
  await knex.schema.createTable('order_items', (t) => {
    t.increments('id').primary();
    t.integer('order_id').references('id').inTable('orders').onDelete('CASCADE');
    t.integer('product_id').references('id').inTable('products').onDelete('SET NULL');
    t.integer('quantity').notNullable();
    t.decimal('unit_price', 10, 2).notNullable();
  });
};

/** @param {import('knex')} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('order_items');
  await knex.schema.dropTableIfExists('orders');
  await knex.schema.dropTableIfExists('product_images');
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('categories');
  await knex.schema.dropTableIfExists('users');
};