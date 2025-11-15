const { Router } = require('express');
const { productCreateSchema, productUpdateSchema } = require('../validation/products');
const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const Category = require('../models/Category');
const { authRequired, adminOnly } = require('../middlewares/auth');
const multer = require('multer');
const { isConfigured, uploadBuffer, uploadUrl, deleteResource } = require('../services/cloudinary');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'));
  }
});

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { category, search, sort = 'created_desc', page = 1, limit = 12 } = req.query;
    const p = Math.max(parseInt(page) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit) || 12, 1), 100);

    let query = Product.query().withGraphFetched('[images, category]').where('active', true);

    if (search) {
      query = query.where(builder => {
        builder.whereILike('name', `%${search}%`).orWhereILike('description', `%${search}%`);
      });
    }

    if (category) {
      // filtrar por slug de categoría
      query = query.whereExists(Category.query().select(1).whereRaw('categories.id = products.category_id').where('slug', category));
    }

    if (sort === 'price_asc') query = query.orderBy('price', 'asc');
    else if (sort === 'price_desc') query = query.orderBy('price', 'desc');
    else query = query.orderBy('created_at', 'desc');

    const total = await query.clone().resultSize();
    const items = await query.page(p - 1, l);
    res.json({ total, page: p, limit: l, items: items.results });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const prod = await Product.query().findById(req.params.id).withGraphFetched('[images, category]');
    if (!prod) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Producto no encontrado' } });
    res.json(prod);
  } catch (err) { next(err); }
});

router.post('/', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { value, error } = productCreateSchema.validate(req.body);
    if (error) return res.status(422).json({ error: { code: 'VALIDATION', message: error.message } });
    const inserted = await Product.query().insert({
      name: value.name,
      description: value.description || '',
      price: value.price,
      stock: value.stock,
      active: value.active !== undefined ? value.active : true,
      category_id: value.categoryId || null
    });
    if (value.images && value.images.length) {
      await ProductImage.query().insert(value.images.map(img => ({ product_id: inserted.id, url: img.url, alt: img.alt || null })));
    }
    const prod = await Product.query().findById(inserted.id).withGraphFetched('[images, category]');
    res.status(201).json(prod);
  } catch (err) { next(err); }
});

router.put('/:id', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { value, error } = productUpdateSchema.validate(req.body);
    if (error) return res.status(422).json({ error: { code: 'VALIDATION', message: error.message } });
    const patch = {};
    if (value.name !== undefined) patch.name = value.name;
    if (value.description !== undefined) patch.description = value.description;
    if (value.price !== undefined) patch.price = value.price;
    if (value.stock !== undefined) patch.stock = value.stock;
    if (value.active !== undefined) patch.active = value.active;
    if (value.categoryId !== undefined) patch.category_id = value.categoryId;
    const updated = await Product.query().patchAndFetchById(req.params.id, patch);
    if (!updated) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Producto no encontrado' } });
    if (value.images) {
      await ProductImage.query().delete().where('product_id', updated.id);
      await ProductImage.query().insert(value.images.map(img => ({ product_id: updated.id, url: img.url, alt: img.alt || null })));
    }
    const prod = await Product.query().findById(updated.id).withGraphFetched('[images, category]');
    res.json(prod);
  } catch (err) { next(err); }
});

router.delete('/:id', authRequired, adminOnly, async (req, res, next) => {
  try {
    const count = await Product.query().deleteById(req.params.id);
    if (!count) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Producto no encontrado' } });
    await ProductImage.query().delete().where('product_id', req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
});

// Subida de imágenes a un producto
router.post('/:id/images', authRequired, adminOnly, upload.single('image'), async (req, res, next) => {
  try {
    const product = await Product.query().findById(req.params.id);
    if (!product) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Producto no encontrado' } });

    const alt = (req.body && req.body.alt) || null;
    let imageUrl = null;
    let publicId = null;

    if (req.file) {
      // Subir buffer a Cloudinary si está configurado
      if (isConfigured()) {
        const result = await uploadBuffer(req.file.buffer, req.file.originalname);
        imageUrl = result.secure_url || result.url;
        publicId = result.public_id || null;
      } else {
        const err = new Error('Cloudinary no configurado');
        err.code = 'NOT_CONFIGURED'; err.status = 501;
        throw err;
      }
    } else if (req.body && req.body.url) {
      // Opción: subir por URL a Cloudinary si está configurado; si no, guardar URL proporcionada
      if (isConfigured()) {
        const result = await uploadUrl(req.body.url);
        imageUrl = result.secure_url || result.url;
        publicId = result.public_id || null;
      } else {
        imageUrl = req.body.url; // fallback: guardar URL directa
      }
    } else {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Debe enviar archivo "image" o campo "url"' } });
    }

    const inserted = await ProductImage.query().insert({ product_id: product.id, url: imageUrl, alt, public_id: publicId });
    res.status(201).json({ id: inserted.id, url: inserted.url, alt: inserted.alt });
  } catch (err) { next(err); }
});

// Eliminar una imagen de un producto
router.delete('/:id/images/:imageId', authRequired, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.query().findById(req.params.id);
    if (!product) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Producto no encontrado' } });
    const img = await ProductImage.query().findById(req.params.imageId);
    if (!img || img.product_id !== product.id) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Imagen no encontrada para este producto' } });
    // Si hay Cloudinary y tenemos public_id, intentamos borrar el recurso remoto
    if (isConfigured() && img.public_id) {
      try { await deleteResource(img.public_id); } catch (e) { /* ignorar errores remotos */ }
    }
    await ProductImage.query().deleteById(img.id);
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;