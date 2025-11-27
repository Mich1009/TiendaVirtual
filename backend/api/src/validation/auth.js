// Importar librería Joi para validación de datos
const Joi = require('joi');

// ============ ESQUEMA DE REGISTRO ============
// Valida los datos cuando un usuario se registra
const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)                    // Mínimo 2 caracteres
    .max(100)                  // Máximo 100 caracteres
    .required(),               // Campo obligatorio
  
  email: Joi.string()
    .email()                   // Debe ser un email válido
    .required(),               // Campo obligatorio
  
  password: Joi.string()
    .min(6)                    // Mínimo 6 caracteres
    .max(100)                  // Máximo 100 caracteres
    .required()                // Campo obligatorio
});

// ============ ESQUEMA DE LOGIN ============
// Valida los datos cuando un usuario inicia sesión
const loginSchema = Joi.object({
  email: Joi.string()
    .email()                   // Debe ser un email válido
    .required(),               // Campo obligatorio
  
  password: Joi.string()
    .min(6)                    // Mínimo 6 caracteres
    .max(100)                  // Máximo 100 caracteres
    .required()                // Campo obligatorio
});

// ============ ESQUEMA DE RECUPERACIÓN DE CONTRASEÑA ============
// Valida el email cuando se solicita recuperar contraseña
const forgotSchema = Joi.object({
  email: Joi.string()
    .email()                   // Debe ser un email válido
    .required()                // Campo obligatorio
});

// ============ ESQUEMA DE CAMBIO DE CONTRASEÑA ============
// Valida los datos cuando un usuario autenticado cambia su contraseña
const changePasswordSchema = Joi.object({
  oldPassword: Joi.string()
    .min(6)                    // Mínimo 6 caracteres
    .max(100)                  // Máximo 100 caracteres
    .required(),               // Campo obligatorio
  
  newPassword: Joi.string()
    .min(6)                    // Mínimo 6 caracteres
    .max(100)                  // Máximo 100 caracteres
    .required()                // Campo obligatorio
});

// Exportar todos los esquemas de validación
module.exports = { 
  registerSchema, 
  loginSchema, 
  forgotSchema, 
  changePasswordSchema 
};