const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerSchema, loginSchema, forgotSchema, changePasswordSchema } = require('../validation/auth');
const User = require('../models/User');

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const { value, error } = registerSchema.validate(req.body);
    if (error) return res.status(422).json({ error: { code: 'VALIDATION', message: error.message } });
    const exists = await User.query().findOne({ email: value.email });
    if (exists) return res.status(409).json({ error: { code: 'CONFLICT', message: 'Email ya registrado' } });
    const password_hash = await bcrypt.hash(value.password, 10);
    const user = await User.query().insert({ name: value.name, email: value.email, password_hash, role: 'CUSTOMER' });
    return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { value, error } = loginSchema.validate(req.body);
    if (error) return res.status(422).json({ error: { code: 'VALIDATION', message: error.message } });
    const user = await User.query().findOne({ email: value.email });
    if (!user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Credenciales inválidas' } });
    const ok = await bcrypt.compare(value.password, user.password_hash);
    if (!ok) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Credenciales inválidas' } });
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
    return res.json({ accessToken: token });
  } catch (err) {
    next(err);
  }
});

const { authRequired } = require('../middlewares/auth');
router.get('/me', authRequired, async (req, res, next) => {
  try {
    const user = await User.query().findById(req.user.id);
    if (!user) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Usuario no encontrado' } });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
});

// Cambio de contraseña (cuenta)
router.post('/change', authRequired, async (req, res, next) => {
  try {
    const { value, error } = changePasswordSchema.validate(req.body);
    if (error) return res.status(422).json({ error: { code: 'VALIDATION', message: error.message } });
    const user = await User.query().findById(req.user.id);
    if (!user) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Usuario no encontrado' } });
    const ok = await bcrypt.compare(value.oldPassword, user.password_hash);
    if (!ok) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Contraseña actual incorrecta' } });
    const password_hash = await bcrypt.hash(value.newPassword, 10);
    await User.query().patchAndFetchById(user.id, { password_hash });
    return res.json({ message: 'Contraseña actualizada' });
  } catch (err) {
    next(err);
  }
});

// Recuperar contraseña: genera una contraseña temporal y la devuelve (demo/dev)
function generatePassword(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@$%&*';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

router.post('/forgot', async (req, res, next) => {
  try {
    const { value, error } = forgotSchema.validate(req.body);
    if (error) return res.status(422).json({ error: { code: 'VALIDATION', message: error.message } });
    const user = await User.query().findOne({ email: value.email });
    if (!user) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Usuario no encontrado' } });
    const raw = generatePassword();
    const bcrypt = require('bcryptjs');
    const password_hash = await bcrypt.hash(raw, 10);
    await User.query().patchAndFetchById(user.id, { password_hash });
    // Envío por correo si SMTP está configurado
    try {
      const { sendMail, smtpConfigured } = require('../utils/mailer');
      if (smtpConfigured()) {
        const subject = 'Recuperación de contraseña - TiendaVirtual';
        const text = `Hola ${user.name || ''},\n\nTu nueva contraseña temporal es: ${raw}.\nPor seguridad, cámbiala en tu cuenta al iniciar sesión.\n\nSaludos,\nTiendaVirtual`;
        const html = `<p>Hola ${user.name || ''},</p><p>Tu nueva <strong>contraseña temporal</strong> es: <code>${raw}</code>.</p><p>Por seguridad, cámbiala en tu cuenta al iniciar sesión.</p><p>Saludos,<br/>TiendaVirtual</p>`;
        await sendMail({ to: user.email, subject, text, html });
      }
    } catch (mailErr) {
      // No caer por fallo de correo; registramos y seguimos
      console.error('Error enviando correo de recuperación:', mailErr?.message || mailErr);
    }
    const includePassword = (process.env.NODE_ENV || 'development') === 'development' && !process.env.SMTP_PASS;
    return res.json({ message: 'Se generó una contraseña temporal y se envió por correo', generatedPassword: includePassword ? raw : undefined });
  } catch (err) {
    next(err);
  }
});

module.exports = router;