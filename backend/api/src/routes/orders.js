const { Router } = require('express');
const { authRequired, adminOnly } = require('../middlewares/auth');
const { orderCreateSchema, orderStatusSchema } = require('../validation/orders');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const BaseModel = require('../models/BaseModel');

const router = Router();

router.post('/', authRequired, async (req, res, next) => {
  try {
    // Solo clientes pueden crear órdenes (los admins no compran desde el frontend)
    if (!req.user || req.user.role !== 'CUSTOMER') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Solo clientes pueden crear órdenes' } });
    }
    const { value, error } = orderCreateSchema.validate(req.body);
    if (error) return res.status(422).json({ error: { code: 'VALIDATION', message: error.message } });

    const knex = BaseModel.knex();
    const result = await knex.transaction(async (trx) => {
      // Obtener productos y validar stock
      const productIds = value.items.map(i => i.productId);
      const products = await Product.query(trx).whereIn('id', productIds);
      const byId = Object.fromEntries(products.map(p => [p.id, p]));

      // Validaciones
      for (const item of value.items) {
        const p = byId[item.productId];
        if (!p || !p.active) {
          const err = new Error('Producto no disponible');
          err.status = 404; err.code = 'NOT_FOUND';
          throw err;
        }
        if (p.stock < item.quantity) {
          const err = new Error('Stock insuficiente');
          err.status = 400; err.code = 'OUT_OF_STOCK';
          throw err;
        }
      }

      // Calcular total
      let total = 0;
      const itemsWithPrice = value.items.map(i => {
        const price = Number(byId[i.productId].price);
        total += price * i.quantity;
        return { productId: i.productId, quantity: i.quantity, unitPrice: price };
      });

      // Simular pago: derivar marca/last4 y fecha estimada de entrega
      const digits = (value.payment.cardNumber || '').replace(/\D/g, '');
      const brand = value.payment.brand || (digits.startsWith('4') ? 'Visa' : digits.startsWith('5') ? 'Mastercard' : digits ? 'Tarjeta' : null);
      const last4 = value.payment.last4 || (digits.length >= 4 ? digits.slice(-4) : null);
      
      // MODO PRUEBA: Entrega en 1 día para testing
      const eta = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // 1 día
      
      // MODO PRODUCCIÓN: Descomentar para usar días reales
      // const days = Math.floor(Math.random() * 5) + 3; // 3–7 días
      // const eta = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

      // Crear orden (estado PAID por simulación)
      const order = await Order.query(trx).insert({
        user_id: req.user.id,
        total,
        status: 'PAID',
        shipping_name: value.shipping.fullName || null,
        shipping_phone: value.shipping.phone || null,
        shipping_address1: value.shipping.address1 || null,
        shipping_address2: value.shipping.address2 || null,
        shipping_city: value.shipping.city || null,
        shipping_state: value.shipping.state || null,
        shipping_zip: value.shipping.zip || null,
        shipping_country: value.shipping.country || null,
        card_brand: brand,
        card_last4: last4,
        estimated_delivery: eta
      });

      // Insertar items y actualizar stock
      for (const it of itemsWithPrice) {
        await OrderItem.query(trx).insert({ order_id: order.id, product_id: it.productId, quantity: it.quantity, unit_price: it.unitPrice });
        await Product.query(trx).findById(it.productId).patch({ stock: byId[it.productId].stock - it.quantity });
      }

      return order;
    });

    // Respuesta: orden y items + resumen de envío/pago y entrega estimada
    const items = await OrderItem
      .query()
      .where('order_id', result.id)
      .join('products', 'order_items.product_id', 'products.id')
      .select('order_items.*', 'products.name as product_name')
      .select(OrderItem.raw('(SELECT url FROM product_images WHERE product_images.product_id = products.id ORDER BY id ASC LIMIT 1) as product_image_url'));
    res.status(201).json({
      id: result.id,
      total: result.total,
      status: result.status,
      items,
      shipping: {
        fullName: result.shipping_name,
        phone: result.shipping_phone,
        address1: result.shipping_address1,
        address2: result.shipping_address2,
        city: result.shipping_city,
        state: result.shipping_state,
        zip: result.shipping_zip,
        country: result.shipping_country
      },
      payment: {
        brand: result.card_brand,
        last4: result.card_last4
      },
      estimatedDelivery: result.estimated_delivery
    });
  } catch (err) { next(err); }
});

router.get('/my', authRequired, async (req, res, next) => {
  try {
    const orders = await Order.query().where('user_id', req.user.id).orderBy('created_at', 'desc');
    const ids = orders.map(o => o.id);
    const items = ids.length ? await OrderItem
      .query()
      .whereIn('order_id', ids)
      .join('products', 'order_items.product_id', 'products.id')
      .select('order_items.*', 'products.name as product_name')
      .select(OrderItem.raw('(SELECT url FROM product_images WHERE product_images.product_id = products.id ORDER BY id ASC LIMIT 1) as product_image_url'))
      : [];
    const itemsByOrder = items.reduce((acc, it) => {
      (acc[it.order_id] ||= []).push(it); return acc;
    }, {});
    res.json(orders.map(o => ({
      id: o.id,
      total: o.total,
      status: o.status,
      created_at: o.created_at,
      items: (itemsByOrder[o.id] || []).map(item => ({
        order_id: item.order_id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image_url,
        quantity: item.quantity,
        unit_price: item.unit_price
      })),
      shipping: {
        fullName: o.shipping_name,
        phone: o.shipping_phone,
        address1: o.shipping_address1,
        address2: o.shipping_address2,
        city: o.shipping_city,
        state: o.shipping_state,
        zip: o.shipping_zip,
        country: o.shipping_country
      },
      payment: { brand: o.card_brand, last4: o.card_last4 },
      estimatedDelivery: o.estimated_delivery
    })));
  } catch (err) { next(err); }
});

router.get('/', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const p = Math.max(parseInt(page) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const query = Order.query().orderBy('created_at', 'desc');
    const total = await query.clone().resultSize();
    const pageRes = await query.page(p - 1, l);
    res.json({ total, page: p, limit: l, items: pageRes.results });
  } catch (err) { next(err); }
});

router.put('/:id/status', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { value, error } = orderStatusSchema.validate(req.body);
    if (error) return res.status(422).json({ error: { code: 'VALIDATION', message: error.message } });
    const id = parseInt(req.params.id);
    const knex = BaseModel.knex();
    const result = await knex.transaction(async (trx) => {
      const order = await Order.query(trx).findById(id);
      if (!order) {
        const err = new Error('Orden no encontrada');
        err.status = 404; err.code = 'NOT_FOUND';
        throw err;
      }
      if (order.status === value.status) return order; // sin cambios
      if (value.status === 'CANCELLED' && order.status !== 'CANCELLED') {
        // Restituir stock
        const items = await OrderItem.query(trx).where('order_id', order.id);
        for (const it of items) {
          const p = await Product.query(trx).findById(it.product_id);
          if (p) await Product.query(trx).findById(it.product_id).patch({ stock: p.stock + it.quantity });
        }
      }
      const updated = await Order.query(trx).patchAndFetchById(order.id, { status: value.status });
      return updated;
    });
    res.json({ id: result.id, total: result.total, status: result.status });
  } catch (err) { next(err); }
});

module.exports = router;