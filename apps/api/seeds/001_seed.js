const bcrypt = require('bcryptjs');

/** @param {import('knex')} knex */
exports.seed = async function seed(knex) {
  // Limpia
  await knex('order_items').del();
  await knex('orders').del();
  await knex('product_images').del();
  await knex('products').del();
  await knex('categories').del();
  await knex('users').del();

  // Usuarios
  const adminHash = await bcrypt.hash('admin123', 10);
  const clientHash = await bcrypt.hash('cliente123', 10);
  await knex('users').insert([
    { name: 'Admin', email: 'admin@tienda.com', password_hash: adminHash, role: 'ADMIN' },
    { name: 'Cliente Demo', email: 'cliente@tienda.com', password_hash: clientHash, role: 'CUSTOMER' }
  ]);

  // Categorías
  const categories = [
    { name: 'Electrónica', slug: 'electronica' },
    { name: 'Ropa', slug: 'ropa' },
    { name: 'Hogar', slug: 'hogar' }
  ];
  const insertedCategories = await knex('categories').insert(categories).returning(['id', 'slug']);

  const catBySlug = Object.fromEntries(insertedCategories.map(c => [c.slug, c.id]));

  // Productos
  const products = [
    { name: 'Auriculares Bluetooth', description: 'Sonido HD', price: 149.99, stock: 50, active: true, category_id: catBySlug['electronica'] },
    { name: 'Camiseta Básica', description: 'Algodón 100%', price: 19.99, stock: 200, active: true, category_id: catBySlug['ropa'] },
    { name: 'Lámpara LED', description: 'Ahorro energético', price: 29.99, stock: 120, active: true, category_id: catBySlug['hogar'] }
  ];
  const insertedProducts = await knex('products').insert(products).returning(['id']);

  // Imágenes
  await knex('product_images').insert([
    { product_id: insertedProducts[0].id, url: 'https://picsum.photos/seed/auriculares/400/300', alt: 'Auriculares' },
    { product_id: insertedProducts[1].id, url: 'https://picsum.photos/seed/camiseta/400/300', alt: 'Camiseta' },
    { product_id: insertedProducts[2].id, url: 'https://picsum.photos/seed/lampara/400/300', alt: 'Lámpara' }
  ]);
};