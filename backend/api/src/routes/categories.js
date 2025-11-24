const { Router } = require('express');
const { categoryCreateSchema, categoryUpdateSchema } = require('../validation/categories');
const Category = require('../models/Category');
const { toSlug } = require('../utils/strings');
const { authRequired, adminOnly } = require('../middlewares/auth');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const cats = await Category.query().orderBy('name');
    res.json(cats.map(c => ({ id: c.id, name: c.name, slug: c.slug })));
  } catch (err) { next(err); }
});

router.post('/', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { value, error } = categoryCreateSchema.validate(req.body);
    if (error) return res.status(422).json({ error: { code: 'VALIDATION', message: error.message } });
    const slug = toSlug(value.name);
    const exists = await Category.query().findOne({ slug });
    if (exists) return res.status(409).json({ error: { code: 'CONFLICT', message: 'Slug ya existe' } });
    const cat = await Category.query().insert({ name: value.name, slug });
    res.status(201).json({ id: cat.id, name: cat.name, slug: cat.slug });
  } catch (err) { next(err); }
});

router.put('/:id', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { value, error } = categoryUpdateSchema.validate(req.body);
    if (error) return res.status(422).json({ error: { code: 'VALIDATION', message: error.message } });
    const slug = toSlug(value.name);
    const updated = await Category.query().patchAndFetchById(req.params.id, { name: value.name, slug });
    if (!updated) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Categoría no encontrada' } });
    res.json({ id: updated.id, name: updated.name, slug: updated.slug });
  } catch (err) { next(err); }
});

router.delete('/:id', authRequired, adminOnly, async (req, res, next) => {
  try {
    const count = await Category.query().deleteById(req.params.id);
    if (!count) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Categoría no encontrada' } });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;