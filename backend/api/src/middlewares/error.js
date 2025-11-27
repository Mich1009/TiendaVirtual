/**
 * Middleware global para manejar errores
 * Captura todos los errores lanzados en la aplicación
 * 
 * Nota: Debe ser el último middleware registrado en app.js
 * 
 * @param {Error} err - Objeto de error
 * @param {Object} req - Objeto de solicitud HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @param {Function} next - Función para pasar al siguiente middleware
 */
function errorHandler(err, req, res, next) {
  // Obtener código de estado del error (por defecto 500)
  const status = err.status || err.statusCode || 500;
  
  // Obtener código de error (por defecto INTERNAL_ERROR)
  const code = err.code || 'INTERNAL_ERROR';
  
  // Obtener mensaje de error
  const message = err.message || 'Unexpected error';

  // Registrar el error en consola (excepto en tests)
  if (process.env.NODE_ENV !== 'test') {
    // En producción, esto podría integrarse con un logger como Winston o Sentry
    console.error(`[ERROR] ${status} ${code}:`, err);
  }

  // Enviar respuesta de error al cliente
  res.status(status).json({ 
    error: { 
      code, 
      message 
    } 
  });
}

// Exportar el middleware para usarlo en app.js
module.exports = { errorHandler };