const Joi = require('joi');

const productCreateSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow(''),
  price: Joi.number().precision(2).positive().required(),
  stock: Joi.number().integer().min(0).required(),
  active: Joi.boolean().default(true),
  categoryId: Joi.number().integer().allow(null),
  images: Joi.array().items(Joi.object({ url: Joi.string().uri().required(), alt: Joi.string().allow('') })).default([])
});

const productUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(200),
  description: Joi.string().allow(''),
  price: Joi.number().precision(2).positive(),
  stock: Joi.number().integer().min(0),
  active: Joi.boolean(),
  categoryId: Joi.number().integer().allow(null),
  images: Joi.array().items(Joi.object({ url: Joi.string().uri().required(), alt: Joi.string().allow('') }))
});

module.exports = { productCreateSchema, productUpdateSchema };