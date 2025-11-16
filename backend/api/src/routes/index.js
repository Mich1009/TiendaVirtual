const { Router } = require('express');
const auth = require('./auth');
const categories = require('./categories');
const products = require('./products');
const orders = require('./orders');
const users = require('./users');
const settings = require('./settings');
const upload = require('./upload');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

router.use('/auth', auth);
router.use('/categories', categories);
router.use('/products', products);
router.use('/orders', orders);
router.use('/users', users);
router.use('/settings', settings);
router.use('/upload', upload);

module.exports = router;