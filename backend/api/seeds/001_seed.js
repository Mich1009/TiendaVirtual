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
    { name: 'Hogar', slug: 'hogar' },
    { name: 'Deportes', slug: 'deportes' },
    { name: 'Libros', slug: 'libros' }
  ];
  const insertedCategories = await knex('categories').insert(categories).returning(['id', 'slug']);

  const catBySlug = Object.fromEntries(insertedCategories.map(c => [c.slug, c.id]));

  // Productos - 30 productos diversos
  const products = [
    // Electrónica (6)
    { name: 'Auriculares Bluetooth', description: 'Sonido HD con cancelación de ruido', price: 149.99, stock: 50, active: true, category_id: catBySlug['electronica'] },
    { name: 'Cable USB-C 2m', description: 'Carga rápida 65W', price: 12.99, stock: 300, active: true, category_id: catBySlug['electronica'] },
    { name: 'Funda Teléfono', description: 'Protección resistente', price: 24.99, stock: 150, active: true, category_id: catBySlug['electronica'] },
    { name: 'Cargador Inalámbrico', description: 'Compatible con todos los dispositivos', price: 34.99, stock: 80, active: true, category_id: catBySlug['electronica'] },
    { name: 'Protector Pantalla', description: 'Cristal templado', price: 9.99, stock: 200, active: true, category_id: catBySlug['electronica'] },
    { name: 'Power Bank 20000mAh', description: 'Carga rápida y doble puerto', price: 45.99, stock: 60, active: true, category_id: catBySlug['electronica'] },
    
    // Ropa (6)
    { name: 'Camiseta Básica', description: 'Algodón 100% premium', price: 19.99, stock: 200, active: true, category_id: catBySlug['ropa'] },
    { name: 'Pantalón Jeans', description: 'Corte moderno', price: 59.99, stock: 120, active: true, category_id: catBySlug['ropa'] },
    { name: 'Sudadera Hoodie', description: 'Cómoda y cálida', price: 49.99, stock: 100, active: true, category_id: catBySlug['ropa'] },
    { name: 'Calcetines Pack 6', description: 'Algodón transpirable', price: 14.99, stock: 250, active: true, category_id: catBySlug['ropa'] },
    { name: 'Gorra Deportiva', description: 'Ajustable', price: 22.99, stock: 90, active: true, category_id: catBySlug['ropa'] },
    { name: 'Chaqueta Ligera', description: 'Resistente al agua', price: 79.99, stock: 70, active: true, category_id: catBySlug['ropa'] },
    
    // Hogar (6)
    { name: 'Lámpara LED', description: 'Ahorro energético 20W', price: 29.99, stock: 120, active: true, category_id: catBySlug['hogar'] },
    { name: 'Almohada Memoria', description: 'Ortopédica ergonómica', price: 39.99, stock: 85, active: true, category_id: catBySlug['hogar'] },
    { name: 'Mantas Fleece', description: 'Suave y cálida', price: 34.99, stock: 110, active: true, category_id: catBySlug['hogar'] },
    { name: 'Cortinas Oscuras', description: 'Reduce luz 95%', price: 44.99, stock: 60, active: true, category_id: catBySlug['hogar'] },
    { name: 'Espejo Pared 50x70', description: 'Marco elegante', price: 54.99, stock: 45, active: true, category_id: catBySlug['hogar'] },
    { name: 'Maceta Cerámica', description: 'Con drenaje', price: 15.99, stock: 180, active: true, category_id: catBySlug['hogar'] },
    
    // Deportes (6)
    { name: 'Botella Agua 750ml', description: 'Térmica de acero', price: 24.99, stock: 200, active: true, category_id: catBySlug['deportes'] },
    { name: 'Mochila Deportiva', description: '30L con compartimentos', price: 49.99, stock: 75, active: true, category_id: catBySlug['deportes'] },
    { name: 'Zapatillas Running', description: 'Amortiguación avanzada', price: 99.99, stock: 55, active: true, category_id: catBySlug['deportes'] },
    { name: 'Banda Elástica Fitness', description: 'Set de 5 resistencias', price: 19.99, stock: 150, active: true, category_id: catBySlug['deportes'] },
    { name: 'Tapete Yoga', description: 'Antideslizante 6mm', price: 29.99, stock: 95, active: true, category_id: catBySlug['deportes'] },
    { name: 'Rodillo Masaje', description: 'Recuperación muscular', price: 39.99, stock: 70, active: true, category_id: catBySlug['deportes'] },
    
    // Libros (6)
    { name: 'Novela Ficción', description: 'Best seller internacional', price: 16.99, stock: 140, active: true, category_id: catBySlug['libros'] },
    { name: 'Guía Programación', description: 'JavaScript y Python', price: 34.99, stock: 50, active: true, category_id: catBySlug['libros'] },
    { name: 'Autoayuda Éxito', description: 'Hábitos y productividad', price: 19.99, stock: 110, active: true, category_id: catBySlug['libros'] },
    { name: 'Recetas Cocina', description: '100 recetas saludables', price: 24.99, stock: 85, active: true, category_id: catBySlug['libros'] },
    { name: 'Historia Universal', description: 'Resumen del mundo', price: 29.99, stock: 60, active: true, category_id: catBySlug['libros'] },
    { name: 'Cómics Aventura', description: 'Serie completa', price: 22.99, stock: 95, active: true, category_id: catBySlug['libros'] }
  ];
  const insertedProducts = await knex('products').insert(products).returning(['id']);

  // Imágenes - URLs dinámicas de Unsplash basadas en el nombre del producto
  const productImages = insertedProducts.map((product, idx) => {
    const productName = products[idx].name;
    
    // Crear slug del nombre para usar en la URL de Unsplash
    const slug = productName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    // Usar Unsplash con búsqueda dinámica basada en el nombre
    const imageUrl = `https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=400&h=300&fit=crop&q=80&auto=format&blend=${encodeURIComponent(productName)}&blend-mode=screen` 
      || `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop`;
    
    // URLs específicas por palabra clave del producto
    let specificUrl = imageUrl;
    
    if (productName.includes('Auriculares') || productName.includes('auriculares')) {
      specificUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop';
    } else if (productName.includes('Cable') || productName.includes('cable')) {
      specificUrl = 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=300&fit=crop';
    } else if (productName.includes('Funda') || productName.includes('funda')) {
      specificUrl = 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=400&h=300&fit=crop';
    } else if (productName.includes('Cargador') || productName.includes('cargador')) {
      specificUrl = 'https://images.unsplash.com/photo-1591601064944-1f77b82a96d3?w=400&h=300&fit=crop';
    } else if (productName.includes('Protector') || productName.includes('protector')) {
      specificUrl = 'https://images.unsplash.com/photo-1551143677-620666121fc1?w=400&h=300&fit=crop';
    } else if (productName.includes('Power Bank') || productName.includes('power bank')) {
      specificUrl = 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop';
    } else if (productName.includes('Camiseta') || productName.includes('camiseta')) {
      specificUrl = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop';
    } else if (productName.includes('Pantalón') || productName.includes('pantalón')) {
      specificUrl = 'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=400&h=300&fit=crop';
    } else if (productName.includes('Sudadera') || productName.includes('sudadera')) {
      specificUrl = 'https://images.unsplash.com/photo-1556821552-9f6db051193a?w=400&h=300&fit=crop';
    } else if (productName.includes('Calcetines') || productName.includes('calcetines')) {
      specificUrl = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop';
    } else if (productName.includes('Gorra') || productName.includes('gorra')) {
      specificUrl = 'https://images.unsplash.com/photo-1623166747601-8f1df5e7f229?w=400&h=300&fit=crop';
    } else if (productName.includes('Chaqueta') || productName.includes('chaqueta')) {
      specificUrl = 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=400&h=300&fit=crop';
    } else if (productName.includes('Lámpara') || productName.includes('lámpara')) {
      specificUrl = 'https://images.unsplash.com/photo-1565636192335-14efb9c8d5c5?w=400&h=300&fit=crop';
    } else if (productName.includes('Almohada') || productName.includes('almohada')) {
      specificUrl = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop';
    } else if (productName.includes('Mantas') || productName.includes('mantas')) {
      specificUrl = 'https://images.unsplash.com/photo-1595642632823-92ec814e3df0?w=400&h=300&fit=crop';
    } else if (productName.includes('Cortinas') || productName.includes('cortinas')) {
      specificUrl = 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&h=300&fit=crop';
    } else if (productName.includes('Espejo') || productName.includes('espejo')) {
      specificUrl = 'https://images.unsplash.com/photo-1578605100442-ebc14e315118?w=400&h=300&fit=crop';
    } else if (productName.includes('Maceta') || productName.includes('maceta')) {
      specificUrl = 'https://images.unsplash.com/photo-1578580219539-b1e0f3a6238d?w=400&h=300&fit=crop';
    } else if (productName.includes('Botella') || productName.includes('botella')) {
      specificUrl = 'https://images.unsplash.com/photo-1556821552-9f6db051193a?w=400&h=300&fit=crop';
    } else if (productName.includes('Mochila') || productName.includes('mochila')) {
      specificUrl = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop';
    } else if (productName.includes('Zapatillas') || productName.includes('zapatillas')) {
      specificUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop';
    } else if (productName.includes('Banda') || productName.includes('banda')) {
      specificUrl = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop';
    } else if (productName.includes('Tapete') || productName.includes('tapete')) {
      specificUrl = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop';
    } else if (productName.includes('Rodillo') || productName.includes('rodillo')) {
      specificUrl = 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=400&h=300&fit=crop';
    } else if (productName.includes('Novela') || productName.includes('novela')) {
      specificUrl = 'https://images.unsplash.com/photo-1507842072343-583f20270319?w=400&h=300&fit=crop';
    } else if (productName.includes('Programación') || productName.includes('programación')) {
      specificUrl = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop';
    } else if (productName.includes('Autoayuda') || productName.includes('autoayuda')) {
      specificUrl = 'https://images.unsplash.com/photo-1507842072343-583f20270319?w=400&h=300&fit=crop';
    } else if (productName.includes('Recetas') || productName.includes('recetas')) {
      specificUrl = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop';
    } else if (productName.includes('Historia') || productName.includes('historia')) {
      specificUrl = 'https://images.unsplash.com/photo-1507842072343-583f20270319?w=400&h=300&fit=crop';
    } else if (productName.includes('Cómics') || productName.includes('cómics')) {
      specificUrl = 'https://images.unsplash.com/photo-1543002588-d83ceddc0f4b?w=400&h=300&fit=crop';
    }
    
    return {
      product_id: product.id,
      url: specificUrl,
      alt: productName
    };
  });
  
  await knex('product_images').insert(productImages);
};