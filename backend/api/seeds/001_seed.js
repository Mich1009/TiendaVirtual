// Importar librería bcryptjs para encriptar contraseñas de forma segura
const bcrypt = require('bcryptjs');

/**
 * Función Seeder - Carga datos iniciales en la base de datos
 * Se ejecuta automáticamente después de las migraciones
 * 
 * @param {import('knex')} knex - Instancia de Knex para acceder a la BD
 */
exports.seed = async function seed(knex) {
  // ============ LIMPIAR DATOS EXISTENTES ============
  // Eliminar todos los registros en orden inverso de dependencias (para evitar errores de FK)
  // order_items depende de orders, así que se elimina primero
  await knex('order_items').del();
  // orders depende de users, así que se elimina después
  await knex('orders').del();
  // product_images depende de products
  await knex('product_images').del();
  // products depende de categories
  await knex('products').del();
  // categories es independiente
  await knex('categories').del();
  // users es independiente
  await knex('users').del();

  // ============ CREAR USUARIOS DE PRUEBA ============
  // Encriptar contraseña del admin con bcrypt (10 rondas de salt)
  const adminHash = await bcrypt.hash('admin123', 10);
  // Encriptar contraseña del cliente con bcrypt
  const clientHash = await bcrypt.hash('cliente123', 10);
  
  // Insertar dos usuarios de prueba en la tabla users
  await knex('users').insert([
    // Usuario administrador con permisos totales
    { name: 'Admin', email: 'admin@tienda.com', password_hash: adminHash, role: 'ADMIN' },
    // Usuario cliente normal para comprar productos
    { name: 'Cliente Demo', email: 'cliente@tienda.com', password_hash: clientHash, role: 'CUSTOMER' }
  ]);

  // ============ CREAR CATEGORÍAS DE PRODUCTOS ============
  // Array con 5 categorías principales para organizar los productos
  const categories = [
    { name: 'Electrónica', slug: 'electronica' },
    { name: 'Ropa', slug: 'ropa' },
    { name: 'Hogar', slug: 'hogar' },
    { name: 'Deportes', slug: 'deportes' },
    { name: 'Libros', slug: 'libros' }
  ];
  
  // Insertar categorías en la BD y obtener sus IDs generados
  const insertedCategories = await knex('categories').insert(categories).returning(['id', 'slug']);

  // Crear un objeto que mapea slug -> id para fácil acceso
  // Ejemplo: catBySlug['electronica'] = 1
  const catBySlug = Object.fromEntries(insertedCategories.map(c => [c.slug, c.id]));

  // ============ CREAR 30 PRODUCTOS DE PRUEBA ============
  // Array con 30 productos distribuidos en 5 categorías (6 por categoría)
  const products = [
    // ===== ELECTRÓNICA (6 productos) =====
    { name: 'Auriculares Bluetooth', description: 'Sonido HD con cancelación de ruido', price: 149.99, stock: 50, active: true, category_id: catBySlug['electronica'] },
    { name: 'Cable USB-C 2m', description: 'Carga rápida 65W', price: 12.99, stock: 300, active: true, category_id: catBySlug['electronica'] },
    { name: 'Funda Teléfono', description: 'Protección resistente', price: 24.99, stock: 150, active: true, category_id: catBySlug['electronica'] },
    { name: 'Cargador Inalámbrico', description: 'Compatible con todos los dispositivos', price: 34.99, stock: 80, active: true, category_id: catBySlug['electronica'] },
    { name: 'Protector Pantalla', description: 'Cristal templado', price: 9.99, stock: 200, active: true, category_id: catBySlug['electronica'] },
    { name: 'Power Bank 20000mAh', description: 'Carga rápida y doble puerto', price: 45.99, stock: 60, active: true, category_id: catBySlug['electronica'] },
    
    // ===== ROPA (6 productos) =====
    { name: 'Camiseta Básica', description: 'Algodón 100% premium', price: 19.99, stock: 200, active: true, category_id: catBySlug['ropa'] },
    { name: 'Pantalón Jeans', description: 'Corte moderno', price: 59.99, stock: 120, active: true, category_id: catBySlug['ropa'] },
    { name: 'Sudadera Hoodie', description: 'Cómoda y cálida', price: 49.99, stock: 100, active: true, category_id: catBySlug['ropa'] },
    { name: 'Calcetines Pack 6', description: 'Algodón transpirable', price: 14.99, stock: 250, active: true, category_id: catBySlug['ropa'] },
    { name: 'Gorra Deportiva', description: 'Ajustable', price: 22.99, stock: 90, active: true, category_id: catBySlug['ropa'] },
    { name: 'Chaqueta Ligera', description: 'Resistente al agua', price: 79.99, stock: 70, active: true, category_id: catBySlug['ropa'] },
    
    // ===== HOGAR (6 productos) =====
    { name: 'Lámpara LED', description: 'Ahorro energético 20W', price: 29.99, stock: 120, active: true, category_id: catBySlug['hogar'] },
    { name: 'Almohada Memoria', description: 'Ortopédica ergonómica', price: 39.99, stock: 85, active: true, category_id: catBySlug['hogar'] },
    { name: 'Mantas Fleece', description: 'Suave y cálida', price: 34.99, stock: 110, active: true, category_id: catBySlug['hogar'] },
    { name: 'Cortinas Oscuras', description: 'Reduce luz 95%', price: 44.99, stock: 60, active: true, category_id: catBySlug['hogar'] },
    { name: 'Espejo Pared 50x70', description: 'Marco elegante', price: 54.99, stock: 45, active: true, category_id: catBySlug['hogar'] },
    { name: 'Maceta Cerámica', description: 'Con drenaje', price: 15.99, stock: 180, active: true, category_id: catBySlug['hogar'] },
    
    // ===== DEPORTES (6 productos) =====
    { name: 'Botella Agua 750ml', description: 'Térmica de acero', price: 24.99, stock: 200, active: true, category_id: catBySlug['deportes'] },
    { name: 'Mochila Deportiva', description: '30L con compartimentos', price: 49.99, stock: 75, active: true, category_id: catBySlug['deportes'] },
    { name: 'Zapatillas Running', description: 'Amortiguación avanzada', price: 99.99, stock: 55, active: true, category_id: catBySlug['deportes'] },
    { name: 'Banda Elástica Fitness', description: 'Set de 5 resistencias', price: 19.99, stock: 150, active: true, category_id: catBySlug['deportes'] },
    { name: 'Tapete Yoga', description: 'Antideslizante 6mm', price: 29.99, stock: 95, active: true, category_id: catBySlug['deportes'] },
    { name: 'Rodillo Masaje', description: 'Recuperación muscular', price: 39.99, stock: 70, active: true, category_id: catBySlug['deportes'] },
    
    // ===== LIBROS (6 productos) =====
    { name: 'Novela Ficción', description: 'Best seller internacional', price: 16.99, stock: 140, active: true, category_id: catBySlug['libros'] },
    { name: 'Guía Programación', description: 'JavaScript y Python', price: 34.99, stock: 50, active: true, category_id: catBySlug['libros'] },
    { name: 'Autoayuda Éxito', description: 'Hábitos y productividad', price: 19.99, stock: 110, active: true, category_id: catBySlug['libros'] },
    { name: 'Recetas Cocina', description: '100 recetas saludables', price: 24.99, stock: 85, active: true, category_id: catBySlug['libros'] },
    { name: 'Historia Universal', description: 'Resumen del mundo', price: 29.99, stock: 60, active: true, category_id: catBySlug['libros'] },
    { name: 'Cómics Aventura', description: 'Serie completa', price: 22.99, stock: 95, active: true, category_id: catBySlug['libros'] }
  ];
  
  // Insertar todos los productos en la BD y obtener sus IDs generados
  const insertedProducts = await knex('products').insert(products).returning(['id']);

  // ============ CREAR IMÁGENES PARA CADA PRODUCTO ============
  // Mapear cada producto a una imagen de Unsplash que coincida con su tipo
  const productImages = insertedProducts.map((product, idx) => {
    // Obtener el nombre del producto usando el índice
    const productName = products[idx].name;
    
    // Objeto que mapea palabras clave del producto a URLs de imágenes de Unsplash
    // Cada URL es una imagen real que coincide con el tipo de producto
    const imageMap = {
      'Auriculares': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&q=80',
      'Cable': 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=300&fit=crop&q=80',
      'Funda': 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=400&h=300&fit=crop&q=80',
      'Cargador': 'https://images.unsplash.com/photo-1591601064944-1f77b82a96d3?w=400&h=300&fit=crop&q=80',
      'Protector': 'https://images.unsplash.com/photo-1551143677-620666121fc1?w=400&h=300&fit=crop&q=80',
      'Power Bank': 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop&q=80',
      'Camiseta': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop&q=80',
      'Pantalón': 'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=400&h=300&fit=crop&q=80',
      'Sudadera': 'https://images.unsplash.com/photo-1556821552-9f6db051193a?w=400&h=300&fit=crop&q=80',
      'Calcetines': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop&q=80',
      'Gorra': 'https://images.unsplash.com/photo-1623166747601-8f1df5e7f229?w=400&h=300&fit=crop&q=80',
      'Chaqueta': 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=400&h=300&fit=crop&q=80',
      'Lámpara': 'https://images.unsplash.com/photo-1565636192335-14efb9c8d5c5?w=400&h=300&fit=crop&q=80',
      'Almohada': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop&q=80',
      'Mantas': 'https://images.unsplash.com/photo-1595642632823-92ec814e3df0?w=400&h=300&fit=crop&q=80',
      'Cortinas': 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&h=300&fit=crop&q=80',
      'Espejo': 'https://images.unsplash.com/photo-1578605100442-ebc14e315118?w=400&h=300&fit=crop&q=80',
      'Maceta': 'https://images.unsplash.com/photo-1578580219539-b1e0f3a6238d?w=400&h=300&fit=crop&q=80',
      'Botella': 'https://images.unsplash.com/photo-1556821552-9f6db051193a?w=400&h=300&fit=crop&q=80',
      'Mochila': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop&q=80',
      'Zapatillas': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&q=80',
      'Banda': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop&q=80',
      'Tapete': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop&q=80',
      'Rodillo': 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=400&h=300&fit=crop&q=80',
      'Novela': 'https://images.unsplash.com/photo-1507842072343-583f20270319?w=400&h=300&fit=crop&q=80',
      'Programación': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop&q=80',
      'Autoayuda': 'https://images.unsplash.com/photo-1507842072343-583f20270319?w=400&h=300&fit=crop&q=80',
      'Recetas': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&q=80',
      'Historia': 'https://images.unsplash.com/photo-1507842072343-583f20270319?w=400&h=300&fit=crop&q=80',
      'Cómics': 'https://images.unsplash.com/photo-1543002588-d83ceddc0f4b?w=400&h=300&fit=crop&q=80'
    };
    
    // URL por defecto si no coincide con ninguna palabra clave
    let specificUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&q=80';
    
    // Buscar en el mapa de imágenes si el nombre del producto contiene alguna palabra clave
    for (const [key, url] of Object.entries(imageMap)) {
      if (productName.includes(key)) {
        specificUrl = url;
        break; // Salir del loop una vez encontrada la coincidencia
      }
    }
    
    // Retornar objeto con la información de la imagen del producto
    return {
      product_id: product.id,  // ID del producto
      url: specificUrl,         // URL de la imagen
      alt: productName          // Texto alternativo para accesibilidad
    };
  });
  
  // Insertar todas las imágenes en la tabla product_images
  await knex('product_images').insert(productImages);
};