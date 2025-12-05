# 💰 Cómo Cambiar Precios desde el Backend - Explicación Simple

## 🎯 ¿Qué significa "cambiar desde el backend"?

**Backend = El servidor (Node.js)**

Hay 3 formas de cambiar precios:

1. **Desde la app (lo que ves)** - Admin presiona botones
2. **Desde el código del backend** - Escribes código que cambia precios
3. **Desde la base de datos directamente** - Ejecutas comandos SQL

---

## 📍 Ubicación de la Base de Datos

### ¿Dónde están los precios?

```
PostgreSQL (Base de Datos)
    ↓
Tabla: products
    ↓
Columnas: id, name, price, stock, ...
    ↓
Ejemplo:
┌────┬─────────┬────────┐
│ id │  name   │ price  │
├────┼─────────┼────────┤
│ 1  │ Laptop  │ 999.99 │
│ 2  │ Mouse   │ 29.99  │
│ 3  │ Teclado │ 79.99  │
└────┴─────────┴────────┘
```

---

## 🔧 Forma 1: Cambiar Precio Directamente en la BD (Más Simple)

### Paso 1: Conectar a PostgreSQL

**Opción A: Usar pgAdmin (Interfaz Gráfica)**

```
1. Abre pgAdmin (http://localhost:5050)
2. Conecta a tu servidor PostgreSQL
3. Navega a: Databases → tiendavirtual → Schemas → public → Tables → products
4. Click derecho → View/Edit Data
```

**Opción B: Usar Terminal**

```bash
# Conectar a PostgreSQL
psql -U postgres -d tiendavirtual

# Verás el prompt:
tiendavirtual=#
```

### Paso 2: Ver los Productos Actuales

```sql
-- Ver todos los productos
SELECT id, name, price FROM products;

-- Resultado:
 id │  name   │ price
────┼─────────┼────────
  1 │ Laptop  │ 999.99
  2 │ Mouse   │ 29.99
  3 │ Teclado │ 79.99
```

### Paso 3: Cambiar el Precio

**Cambiar precio de UN producto:**

```sql
-- Cambiar Laptop a $1,299.99
UPDATE products SET price = 1299.99 WHERE id = 1;

-- Resultado:
UPDATE 1
```

**Cambiar precio de VARIOS productos:**

```sql
-- Aumentar todos los precios en 10%
UPDATE products SET price = price * 1.10;

-- Resultado:
UPDATE 3
```

**Cambiar precio de una categoría:**

```sql
-- Todos los productos de "Electrónica" reciben 15% de descuento
UPDATE products 
SET price = price * 0.85 
WHERE category_id = 1;

-- Resultado:
UPDATE 5
```

### Paso 4: Verificar el Cambio

```sql
-- Ver los precios actualizados
SELECT id, name, price FROM products;

-- Resultado:
 id │  name   │ price
────┼─────────┼────────
  1 │ Laptop  │ 1299.99
  2 │ Mouse   │ 32.99
  3 │ Teclado │ 87.99
```

---

## 💻 Forma 2: Cambiar Precio con Código Node.js (Script)

### ¿Qué es un Script?

Un script es un archivo `.js` que ejecutas desde la terminal. Hace cambios automáticamente.

### Paso 1: Crear el Script

**Crear archivo:** `backend/api/scripts/cambiar-precios.js`

```javascript
#!/usr/bin/env node

/**
 * Script para cambiar precios de productos
 * 
 * Uso:
 * cd backend/api
 * node scripts/cambiar-precios.js
 */

// Cargar variables de entorno
require('dotenv').config();

// Conectar a la base de datos
const knex = require('../src/db/knex');

async function cambiarPrecios() {
  try {
    console.log('🔄 Iniciando cambio de precios...\n');
    
    // ============ EJEMPLO 1: Cambiar UN producto ============
    console.log('1️⃣ Cambiando precio de Laptop...');
    
    await knex('products')
      .where({ id: 1 })  // Busca el producto con id = 1
      .update({
        price: 1299.99    // Cambia el precio a 1299.99
      });
    
    console.log('✅ Laptop actualizada a $1,299.99\n');
    
    // ============ EJEMPLO 2: Aumentar todos los precios ============
    console.log('2️⃣ Aumentando todos los precios en 10%...');
    
    await knex('products')
      .update({
        price: knex.raw('price * 1.10')  // Multiplica cada precio por 1.10
      });
    
    console.log('✅ Todos los precios aumentados en 10%\n');
    
    // ============ EJEMPLO 3: Aplicar descuento ============
    console.log('3️⃣ Aplicando descuento del 20% a productos caros...');
    
    await knex('products')
      .where('price', '>', 500)  // Solo productos > $500
      .update({
        price: knex.raw('price * 0.80')  // Descuento del 20%
      });
    
    console.log('✅ Descuento aplicado\n');
    
    // ============ VERIFICAR CAMBIOS ============
    console.log('📊 Precios actuales:');
    const productos = await knex('products').select('id', 'name', 'price');
    console.table(productos);
    
    console.log('\n✅ Cambios completados');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar
cambiarPrecios();
```

### Paso 2: Ejecutar el Script

```bash
# Navegar a la carpeta del backend
cd backend/api

# Ejecutar el script
node scripts/cambiar-precios.js

# Verás en la terminal:
# 🔄 Iniciando cambio de precios...
# 
# 1️⃣ Cambiando precio de Laptop...
# ✅ Laptop actualizada a $1,299.99
# 
# 2️⃣ Aumentando todos los precios en 10%...
# ✅ Todos los precios aumentados en 10%
# 
# 3️⃣ Aplicando descuento del 20% a productos caros...
# ✅ Descuento aplicado
# 
# 📊 Precios actuales:
# ┌────┬─────────┬────────┐
# │ id │  name   │ price  │
# ├────┼─────────┼────────┤
# │ 1  │ Laptop  │ 1429.99│
# │ 2  │ Mouse   │ 32.99  │
# │ 3  │ Teclado │ 87.99  │
# └────┴─────────┴────────┘
```

---

## 📝 Explicación Línea por Línea

### Cambiar UN Producto

```javascript
await knex('products')           // Accede a la tabla "products"
  .where({ id: 1 })             // Busca el producto con id = 1
  .update({                      // Actualiza
    price: 1299.99               // El precio a 1299.99
  });
```

**En SQL sería:**
```sql
UPDATE products SET price = 1299.99 WHERE id = 1;
```

**Paso a paso:**
1. `knex('products')` → Accede a la tabla de productos
2. `.where({ id: 1 })` → Filtra solo el producto con id = 1
3. `.update({ price: 1299.99 })` → Cambia el precio a 1299.99

---

### Aumentar Todos los Precios en 10%

```javascript
await knex('products')           // Accede a la tabla "products"
  .update({                      // Actualiza
    price: knex.raw('price * 1.10')  // Multiplica cada precio por 1.10
  });
```

**En SQL sería:**
```sql
UPDATE products SET price = price * 1.10;
```

**Paso a paso:**
1. `knex('products')` → Accede a la tabla de productos
2. `.update({ price: knex.raw('price * 1.10') })` → Multiplica cada precio por 1.10
   - Si precio es $100 → $100 × 1.10 = $110
   - Si precio es $50 → $50 × 1.10 = $55

---

### Aplicar Descuento a Productos Caros

```javascript
await knex('products')           // Accede a la tabla "products"
  .where('price', '>', 500)      // Solo productos con precio > $500
  .update({                      // Actualiza
    price: knex.raw('price * 0.80')  // Multiplica por 0.80 (descuento 20%)
  });
```

**En SQL sería:**
```sql
UPDATE products SET price = price * 0.80 WHERE price > 500;
```

**Paso a paso:**
1. `knex('products')` → Accede a la tabla de productos
2. `.where('price', '>', 500)` → Filtra solo productos > $500
3. `.update({ price: knex.raw('price * 0.80') })` → Descuento del 20%
   - Si precio es $1000 → $1000 × 0.80 = $800
   - Si precio es $600 → $600 × 0.80 = $480

---

## 🎯 Ejemplos Prácticos

### Ejemplo 1: Cambiar Laptop a $1,299.99

**Script:**
```javascript
await knex('products')
  .where({ id: 1 })
  .update({ price: 1299.99 });
```

**Resultado:**
```
ANTES: Laptop - $999.99
DESPUÉS: Laptop - $1,299.99
```

---

### Ejemplo 2: Descuento del 15% en Electrónica

**Script:**
```javascript
await knex('products')
  .where('category_id', 1)  // ID de categoría Electrónica
  .update({
    price: knex.raw('price * 0.85')  // 15% de descuento
  });
```

**Resultado:**
```
ANTES:
- Laptop: $999.99
- Mouse: $29.99

DESPUÉS:
- Laptop: $849.99
- Mouse: $25.49
```

---

### Ejemplo 3: Black Friday - 50% de Descuento

**Script:**
```javascript
await knex('products')
  .update({
    price: knex.raw('price * 0.50')  // 50% de descuento
  });
```

**Resultado:**
```
ANTES:
- Laptop: $999.99
- Mouse: $29.99
- Teclado: $79.99

DESPUÉS:
- Laptop: $500.00
- Mouse: $15.00
- Teclado: $40.00
```

---

## 🔄 Flujo Completo: Cambiar Precio con Script

```
┌─────────────────────────────────────────────────────────────┐
│                    TÚ EN LA TERMINAL                        │
│                                                             │
│  $ cd backend/api                                           │
│  $ node scripts/cambiar-precios.js                          │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    SCRIPT (Node.js)                         │
│                                                             │
│  1. Carga variables de entorno (.env)                       │
│  2. Conecta a PostgreSQL                                    │
│  3. Ejecuta: UPDATE products SET price = ...               │
│  4. Muestra resultados en la terminal                       │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS                            │
│                                                             │
│  UPDATE products SET price = price * 1.10                  │
│                                                             │
│  Tabla products:                                            │
│  ┌────┬─────────┬────────┐                                 │
│  │ id │  name   │ price  │                                 │
│  ├────┼─────────┼────────┤                                 │
│  │ 1  │ Laptop  │ 1099.99│ ← Cambió de 999.99             │
│  │ 2  │ Mouse   │ 32.99  │ ← Cambió de 29.99              │
│  │ 3  │ Teclado │ 87.99  │ ← Cambió de 79.99              │
│  └────┴─────────┴────────┘                                 │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTES EN LA APP                       │
│                                                             │
│  Ven los nuevos precios:                                    │
│  - Laptop: $1,099.99                                        │
│  - Mouse: $32.99                                            │
│  - Teclado: $87.99                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Comparación: Las 3 Formas

| Forma | Cómo | Cuándo Usar | Dificultad |
|-------|------|-------------|-----------|
| **App (Admin)** | Presionar botones | Cambios ocasionales | Fácil |
| **Script** | Ejecutar comando | Cambios masivos | Medio |
| **SQL Directo** | Escribir SQL | Cambios rápidos | Difícil |

---

## ⚠️ Importante: Cambios Inmediatos

**Cuando cambias un precio:**

1. ✅ Se actualiza en la BD inmediatamente
2. ✅ Los clientes ven el nuevo precio al recargar
3. ✅ Los carritos activos mantienen el precio anterior
4. ✅ Al checkout, se usa el precio actual de la BD

**Ejemplo:**
```
1. Cliente agrega Laptop a $999.99 al carrito
2. Ejecutas script: cambiar precio a $1,299.99
3. Cliente ve en su carrito: $999.99 (precio local)
4. Cliente va a checkout
5. Backend obtiene precio actual: $1,299.99
6. Cliente paga: $1,299.99
```

---

## 🚀 Resumen

**Para cambiar precios desde el backend:**

1. **Opción más simple:** Usar SQL directamente en pgAdmin
   ```sql
   UPDATE products SET price = 1299.99 WHERE id = 1;
   ```

2. **Opción más práctica:** Crear un script Node.js
   ```bash
   node scripts/cambiar-precios.js
   ```

3. **Opción más flexible:** Crear un endpoint API
   ```
   POST /v1/admin/apply-discount
   ```

**Todos los cambios se guardan en la BD y los clientes los ven inmediatamente.**

