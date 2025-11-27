// Importar framework Express para crear la aplicación web
const express = require('express');

// Importar middleware CORS para permitir solicitudes desde otros dominios
const cors = require('cors');

// Importar Helmet para agregar headers de seguridad HTTP
const helmet = require('helmet');

// Importar Morgan para registrar (log) todas las solicitudes HTTP
const morgan = require('morgan');

// Importar todas las rutas de la API
const routes = require('./routes');

// Importar middleware personalizado para manejar errores
const { errorHandler } = require('./middlewares/error');

// Crear la aplicación Express
const app = express();

// ============ MIDDLEWARES DE SEGURIDAD Y CONFIGURACIÓN ============

// Helmet: Agrega headers de seguridad HTTP para proteger contra vulnerabilidades comunes
app.use(helmet());

// CORS: Permite que clientes desde cualquier origen hagan solicitudes a esta API
app.use(cors({ origin: '*'}));

// Parser JSON: Convierte el cuerpo de las solicitudes JSON a objetos JavaScript
// Límite de 5MB para permitir subida de imágenes codificadas en base64
app.use(express.json({ limit: '5mb' }));

// Parser URL-encoded: Convierte datos de formularios a objetos JavaScript
// Límite de 5MB y extended: true permite objetos anidados
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Morgan: Registra todas las solicitudes HTTP en la consola (formato 'dev' es colorido y legible)
app.use(morgan('dev'));

// ============ RUTAS DE LA API ============

// Todas las rutas de la API están bajo el prefijo /v1 (versionado)
app.use('/v1', routes);

// ============ MANEJO DE ERRORES ============

// Middleware para rutas no encontradas (404)
// Si ninguna ruta anterior coincide, devuelve error 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Middleware de manejo de errores global (debe ir al final)
// Captura todos los errores lanzados en la aplicación
app.use(errorHandler);

// Exportar la aplicación para que pueda ser usada en index.js
module.exports = app;