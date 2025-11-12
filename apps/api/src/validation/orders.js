const Joi = require('joi');

const orderCreateSchema = Joi.object({
  items: Joi.array().items(Joi.object({
    productId: Joi.number().integer().required(),
    quantity: Joi.number().integer().min(1).required()
  })).min(1).required(),
  shipping: Joi.object({
    fullName: Joi.string().allow(''),
    phone: Joi.string().allow(''),
    address1: Joi.string().allow(''),
    address2: Joi.string().allow(''),
    city: Joi.string().allow(''),
    state: Joi.string().allow(''),
    zip: Joi.string().allow(''),
    country: Joi.string().allow('')
  }).default({}),
  payment: Joi.object({
    cardNumber: Joi.string().allow(''),
    brand: Joi.string().allow(''),
    last4: Joi.string().allow(''),
    expiry: Joi.string().allow('')
  }).default({})
});

const orderStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'PAID', 'CANCELLED').required()
});

module.exports = { orderCreateSchema, orderStatusSchema };