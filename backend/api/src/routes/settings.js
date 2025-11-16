const { Router } = require('express');
const knex = require('../db/knex');
const { authRequired, adminOnly } = require('../middlewares/auth');

const router = Router();

/**
 * GET /v1/settings
 * Obtener toda la configuración de la tienda (público)
 */
router.get('/', async (req, res, next) => {
  try {
    const settings = await knex('store_settings').select('key', 'value');
    
    // Convertir array a objeto
    const config = settings.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});
    
    res.json(config);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /v1/settings/:key
 * Actualizar una configuración específica (solo admin)
 */
router.put('/:key', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    // Validar que la key sea válida
    const validKeys = ['store_name', 'store_logo', 'font_family'];
    if (!validKeys.includes(key)) {
      return res.status(400).json({ error: 'Configuración inválida' });
    }
    
    // Actualizar o insertar
    const exists = await knex('store_settings').where({ key }).first();
    
    if (exists) {
      await knex('store_settings')
        .where({ key })
        .update({ 
          value,
          updated_at: knex.fn.now()
        });
    } else {
      await knex('store_settings').insert({ key, value });
    }
    
    res.json({ key, value });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /v1/settings
 * Actualizar múltiples configuraciones a la vez (solo admin)
 */
router.put('/', authRequired, adminOnly, async (req, res, next) => {
  try {
    const updates = req.body; // { store_name: 'X', store_logo: 'Y', ... }
    
    const validKeys = ['store_name', 'store_logo', 'font_family'];
    const results = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (validKeys.includes(key)) {
        const exists = await knex('store_settings').where({ key }).first();
        
        if (exists) {
          await knex('store_settings')
            .where({ key })
            .update({ 
              value,
              updated_at: knex.fn.now()
            });
        } else {
          await knex('store_settings').insert({ key, value });
        }
        
        results[key] = value;
      }
    }
    
    res.json(results);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
