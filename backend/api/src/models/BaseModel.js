const { Model } = require('objection');

class BaseModel extends Model {
  $formatJson(json) {
    const formatted = super.$formatJson(json);
    // Convierte snake_case a camelCase para algunas columnas comunes
    if (formatted.created_at && !formatted.createdAt) {
      formatted.createdAt = formatted.created_at;
      delete formatted.created_at;
    }
    return formatted;
  }
}

module.exports = BaseModel;