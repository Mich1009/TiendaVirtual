// Importar librería JWT para verificar tokens
const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar que el usuario está autenticado
 * Valida el token JWT en el header Authorization
 * 
 * Uso: app.get('/ruta-protegida', authRequired, controlador)
 * 
 * @param {Object} req - Objeto de solicitud HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @param {Function} next - Función para pasar al siguiente middleware
 */
function authRequired(req, res, next) {
  // Obtener el header Authorization (ej: "Bearer token123")
  const header = req.headers['authorization'] || '';
  
  // Extraer el token si comienza con "Bearer "
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  
  // Si no hay token, retornar error 401 (no autorizado)
  if (!token) {
    return res.status(401).json({ 
      error: { 
        code: 'UNAUTHORIZED', 
        message: 'Token requerido' 
      } 
    });
  }
  
  try {
    // Verificar que el token es válido usando la clave secreta
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    
    // Guardar la información del usuario en req.user para usarla después
    req.user = payload;
    
    // Pasar al siguiente middleware
    next();
  } catch (err) {
    // Si el token es inválido o expiró, retornar error 401
    return res.status(401).json({ 
      error: { 
        code: 'UNAUTHORIZED', 
        message: 'Token inválido' 
      } 
    });
  }
}

/**
 * Middleware para verificar que el usuario es administrador
 * Debe usarse después de authRequired
 * 
 * Uso: app.delete('/ruta-admin', authRequired, adminOnly, controlador)
 * 
 * @param {Object} req - Objeto de solicitud HTTP (debe tener req.user)
 * @param {Object} res - Objeto de respuesta HTTP
 * @param {Function} next - Función para pasar al siguiente middleware
 */
function adminOnly(req, res, next) {
  // Verificar que el usuario existe y tiene rol ADMIN
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: { 
        code: 'FORBIDDEN', 
        message: 'Requiere rol ADMIN' 
      } 
    });
  }
  
  // Si es admin, pasar al siguiente middleware
  next();
}

// Exportar los middlewares para usarlos en las rutas
module.exports = { authRequired, adminOnly };