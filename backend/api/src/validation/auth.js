const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required()
});

module.exports = { registerSchema, loginSchema };
 
// Extra: esquema para "forgot password"
const forgotSchema = Joi.object({
  email: Joi.string().email().required()
});

// Cambio de contraseña (cuenta): requiere contraseña actual y nueva
const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().min(6).max(100).required(),
  newPassword: Joi.string().min(6).max(100).required(),
});

module.exports = { registerSchema, loginSchema, forgotSchema, changePasswordSchema };