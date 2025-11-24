const Joi = require('joi');

const categoryCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
});

const categoryUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
});

module.exports = { categoryCreateSchema, categoryUpdateSchema };