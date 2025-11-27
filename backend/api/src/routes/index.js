// Importar Router de Express para crear rutas
const { Router } = require('express');

// Importar módulos de rutas específicas
const auth = require('./auth');              // Rutas de autenticación (login, register)
const categories = require('./categories');  // Rutas de categorías
const products = require('./products');      // Rutas de productos
const orders = require('./orders');          // Rutas de pedidos
const users = require('./users');            // Rutas de usuarios (admin)
const settings = require('./settings');      // Rutas de configuración
const upload = require('./upload');          // Rutas de subida de archivos

// Crear router principal
const router = Router();

// ============ RUTA DE SALUD ============
// Endpoint para verificar que el servidor está corriendo
// Retorna estado y tiempo de actividad del servidor
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',                    // Estado del servidor
    uptime: process.uptime()         // Segundos que lleva corriendo
  });
});

// ============ RUTAS PRINCIPALES ============
// Cada ruta está prefijada con su nombre (ej: /v1/auth/login)

// Rutas de autenticación: /auth/login, /auth/register, etc
router.use('/auth', auth);

// Rutas de categorías: /categories, /categories/:id, etc
router.use('/categories', categories);

// Rutas de productos: /products, /products/:id, etc
router.use('/products', products);

// Rutas de pedidos: /orders, /orders/:id, etc
router.use('/orders', orders);

// Rutas de usuarios (admin): /users, /users/:id, etc
router.use('/users', users);

// Rutas de configuración: /settings, /settings/:key, etc
router.use('/settings', settings);

// Rutas de subida de archivos: /upload, /upload/image, etc
router.use('/upload', upload);

// Exportar el router para usarlo en app.js
module.exports = router;