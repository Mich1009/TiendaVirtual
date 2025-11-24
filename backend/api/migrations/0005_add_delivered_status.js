/**
 * Migración: Documentar estado DELIVERED para órdenes
 * 
 * Nota: No se requiere cambio en la estructura de la tabla
 * porque el campo 'status' ya es un string sin restricciones.
 * Esta migración solo documenta el nuevo estado disponible.
 * 
 * Estados de orden:
 * - PENDING: Pedido creado pero no pagado
 * - PAID: Pedido pagado, en proceso de envío
 * - DELIVERED: Pedido entregado al cliente
 * - CANCELLED: Pedido cancelado
 */

/** @param {import('knex')} knex */
exports.up = async function up(knex) {
  // No se requiere cambio en la estructura
  // El campo 'status' ya acepta cualquier string
  console.log('✓ Estado DELIVERED documentado para órdenes');
};

/** @param {import('knex')} knex */
exports.down = async function down(knex) {
  // No hay cambios que revertir
};
