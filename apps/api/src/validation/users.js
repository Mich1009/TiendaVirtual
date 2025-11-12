const Joi = require('joi');

const roleValues = ['ADMIN', 'CUSTOMER'];

const userCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid(...roleValues).required(),
  // Opcional: si no se envía, se generará automáticamente
  password: Joi.string().min(6).max(100).optional(),
});

const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  // Permitimos cambiar email si es necesario (verificación de conflicto en ruta)
  email: Joi.string().email().optional(),
  role: Joi.string().valid(...roleValues).optional(),
  // Reset explícito de contraseña
  resetPassword: Joi.boolean().optional(),
  password: Joi.string().min(6).max(100).optional(),
}).min(1);

module.exports = { userCreateSchema, userUpdateSchema };