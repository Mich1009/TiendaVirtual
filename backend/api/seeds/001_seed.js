const bcrypt = require('bcryptjs');

/** @param {import('knex')} knex */
exports.seed = async function seed(knex) {
  // Esta versión del seed es idempotente y NO elimina datos existentes.
  // Inserta solo registros que no existan (no sobreescribe cambios de colaboradores).

  // --- Usuarios (no sobrescribir si ya existen) ---
  const adminEmail = 'admin@tienda.com';
  const clientEmail = 'cliente@tienda.com';

  const adminExists = await knex('users').where({ email: adminEmail }).first();
  if (!adminExists) {
    const adminHash = await bcrypt.hash('admin123', 10);
    await knex('users').insert({ name: 'Admin', email: adminEmail, password_hash: adminHash, role: 'ADMIN' });
  }

  const clientExists = await knex('users').where({ email: clientEmail }).first();
  if (!clientExists) {
    const clientHash = await bcrypt.hash('cliente123', 10);
    await knex('users').insert({ name: 'Cliente Demo', email: clientEmail, password_hash: clientHash, role: 'CUSTOMER' });
  }

  // --- Categorías (usar slug como identificador único) ---
  const categories = [
    { name: 'Electrónica', slug: 'electronica' },
    { name: 'Ropa', slug: 'ropa' },
    { name: 'Hogar', slug: 'hogar' }
  ];

  for (const cat of categories) {
    const exists = await knex('categories').where({ slug: cat.slug }).first();
    if (!exists) {
      await knex('categories').insert(cat);
    }
  }

  // Recuperar IDs de categorías (existentes o recién creadas)
  const slugs = categories.map(c => c.slug);
  const dbCategories = await knex('categories').whereIn('slug', slugs).select('id', 'slug');
  const catBySlug = Object.fromEntries(dbCategories.map(c => [c.slug, c.id]));

  // --- Productos (insertar solo si no existe name + category_id) ---
  const products = [
    { name: 'Auriculares Bluetooth', description: 'Sonido HD', price: 149.99, stock: 50, active: true, category_slug: 'electronica' },
    { name: 'Camiseta Básica', description: 'Algodón 100%', price: 19.99, stock: 200, active: true, category_slug: 'ropa' },
    { name: 'Lámpara LED', description: 'Ahorro energético', price: 29.99, stock: 120, active: true, category_slug: 'hogar' }
  ];

  const productIdByNameAndCat = {};

  for (const p of products) {
    const category_id = catBySlug[p.category_slug] || null;
    if (!category_id) continue; // saltar si no hay categoría

    const exists = await knex('products').where({ name: p.name, category_id }).first();
    if (exists) {
      productIdByNameAndCat[`${p.name}::${p.category_slug}`] = exists.id;
      continue;
    }

    const [inserted] = await knex('products').insert({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      active: p.active,
      category_id
    }).returning(['id']);

    productIdByNameAndCat[`${p.name}::${p.category_slug}`] = inserted.id;
  }

  // --- Imágenes (insertar solo si no existe la misma url para el producto) ---
  const images = [
    { product_key: 'Auriculares Bluetooth::electronica', url: 'https://picsum.photos/seed/auriculares/400/300', alt: 'Auriculares' },
    { product_key: 'Camiseta Básica::ropa', url: 'https://picsum.photos/seed/camiseta/400/300', alt: 'Camiseta' },
    { product_key: 'Lámpara LED::hogar', url: 'https://picsum.photos/seed/lampara/400/300', alt: 'Lámpara' }
  ];

  for (const img of images) {
    const product_id = productIdByNameAndCat[img.product_key];
    if (!product_id) continue;

    const exists = await knex('product_images').where({ product_id, url: img.url }).first();
    if (!exists) {
      await knex('product_images').insert({ product_id, url: img.url, alt: img.alt });
    }
  }
};