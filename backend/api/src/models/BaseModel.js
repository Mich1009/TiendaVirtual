// Importar Model de Objection.js (ORM para Knex)
const { Model } = require('objection');

/**
 * Clase base para todos los modelos
 * Proporciona funcionalidad común a todos los modelos de la aplicación
 * 
 * Todos los modelos (User, Product, Order, etc) heredan de esta clase
 */
class BaseModel extends Model {
  /**
   * Formatea el JSON antes de enviarlo al cliente
   * Convierte snake_case (de la BD) a camelCase (para JavaScript)
   * 
   * @param {Object} json - Objeto con datos del modelo
   * @returns {Object} Objeto formateado con camelCase
   */
  $formatJson(json) {
    // Llamar al método padre para obtener el JSON formateado
    const formatted = super.$formatJson(json);
    
    // Convertir created_at a createdAt si existe
    if (formatted.created_at && !formatted.createdAt) {
      formatted.createdAt = formatted.created_at;
      delete formatted.created_at;
    }
    
    // Convertir updated_at a updatedAt si existe
    if (formatted.updated_at && !formatted.updatedAt) {
      formatted.updatedAt = formatted.updated_at;
      delete formatted.updated_at;
    }
    
    return formatted;
  }
}

// Exportar la clase base para que otros modelos la hereden
module.exports = BaseModel;