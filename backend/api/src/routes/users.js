const { Router } = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authRequired, adminOnly } = require('../middlewares/auth');
const { userCreateSchema, userUpdateSchema } = require('../validation/users');

const router = Router();

function generatePassword(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@$%&*';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// Listar usuarios (admin)
router.get('/', authRequired, adminOnly, async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));
    const q = (req.query.search || '').toLowerCase();
    const baseQuery = User.query().orderBy('created_at', 'desc');
    const filteredQuery = q
      ? baseQuery.where((builder) => {
          builder.whereRaw('LOWER(name) LIKE ?', [`%${q}%`])
                 .orWhereRaw('LOWER(email) LIKE ?', [`%${q}%`])
                 .orWhere('role', 'like', `%${q.toUpperCase()}%`);
        })
      : baseQuery;

    const { results, total } = await filteredQuery.page(page - 1, limit);
    const items = results.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.created_at }));
    res.json({ items, total, page, limit });
  } catch (err) { next(err); }
});

// Crear usuario (admin)
router.post('/', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { value, error } = userCreateSchema.validate(req.body);
    if (error) return res.status(422).json({ error: { code: 'VALIDATION', message: error.message } });
    const exists = await User.query().findOne({ email: value.email });
    if (exists) return res.status(409).json({ error: { code: 'CONFLICT', message: 'Email ya registrado' } });

    let rawPassword = value.password;
    if (!rawPassword) rawPassword = generatePassword();
    const password_hash = await bcrypt.hash(rawPassword, 10);
    const user = await User.query().insert({
      name: value.name,
      email: value.email,
      password_hash,
      role: value.role,
    });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, generatedPassword: value.password ? undefined : rawPassword });
  } catch (err) { next(err); }
});

// Actualizar usuario (admin): nombre, email, rol y reset de contraseña
router.put('/:id', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { value, error } = userUpdateSchema.validate(req.body);
    if (error) return res.status(422).json({ error: { code: 'VALIDATION', message: error.message } });

    if (value.email) {
      const exists = await User.query().findOne({ email: value.email });
      if (exists && String(exists.id) !== String(req.params.id)) {
        return res.status(409).json({ error: { code: 'CONFLICT', message: 'Email ya registrado' } });
      }
    }

    const patch = {};
    if (value.name) patch.name = value.name;
    if (value.email) patch.email = value.email;
    if (value.role) patch.role = value.role;

    let generatedPassword;
    if (value.resetPassword && !value.password) {
      const raw = generatePassword();
      patch.password_hash = await bcrypt.hash(raw, 10);
      generatedPassword = raw;
    } else if (value.password) {
      patch.password_hash = await bcrypt.hash(value.password, 10);
    }

    const updated = await User.query().patchAndFetchById(req.params.id, patch);
    if (!updated) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Usuario no encontrado' } });
    res.json({ id: updated.id, name: updated.name, email: updated.email, role: updated.role, generatedPassword });
  } catch (err) { next(err); }
});

// Eliminar usuario (admin)
router.delete('/:id', authRequired, adminOnly, async (req, res, next) => {
  try {
    const count = await User.query().deleteById(req.params.id);
    if (!count) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Usuario no encontrado' } });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;