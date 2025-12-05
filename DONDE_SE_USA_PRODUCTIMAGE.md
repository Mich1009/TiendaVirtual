# 🔍 ¿Dónde se Usa ProductImage?

## 📍 Ubicación de Uso

ProductImage se usa en **4 archivos principales**:

---

## 1️⃣ `backend/api/src/models/Product.js`

### ¿Qué hace?
Define la relación inversa: Un producto tiene MUCHAS imágenes.

### Código:
```javascript
const ProductImage = require('./ProductImage');

static get relationMappings() {
  return {
    images: {
      relation: BaseModel.HasManyRelation,  // ← Un producto tiene MUCHAS imágenes
      modelClass: ProductImage,
      join: {
        from: 'products.id',
        to: 'product_images.product_id'
      }
    }
  };
}
```

### ¿Qué significa?
- `HasManyRelation` = "Tiene muchos"
- Un producto (1) tiene muchas imágenes (N)

### Ejemplo de Uso:
```javascript
// Obtener un producto con todas sus imágenes
const producto = await Product.query()
  .findById(1)
  .withGraphFetched('images');

console.log(producto);
// {
//   id: 1,
//   name: 'Laptop',
//   price: 999.99,
//   images: [
//     { id: 1, product_id: 1, url: 'https://...', alt: 'Laptop foto1' },
//     { id: 2, product_id: 1, url: 'https://...', alt: 'Laptop foto2' }
//   ]
// }
```

---

## 2️⃣ `backend/api/src/routes/products.js`

### ¿Qué hace?
Maneja las operaciones CRUD (crear, leer, actualizar, eliminar) de imágenes.

### Ubicación 1: Crear Producto con Imágenes

**Línea 71:**
```javascript
if (value.images && value.images.length) {
  await ProductImage.query().insert(
    value.images.map(img => ({ 
      product_id: inserted.id, 
      url: img.url, 
      alt: img.alt || null 
    }))
  );
}
```

**¿Qué hace?**
Cuando se crea un producto, también crea sus imágenes.

**Flujo:**
```
1. Admin crea producto: Laptop
2. Envía: { name: 'Laptop', images: [...] }
3. Backend crea el producto
4. Backend crea las imágenes asociadas
5. Retorna producto con imágenes
```

**Ejemplo:**
```javascript
// Admin envía:
POST /v1/products
{
  "name": "Laptop",
  "price": 999.99,
  "images": [
    { "url": "https://...", "alt": "Laptop foto1" },
    { "url": "https://...", "alt": "Laptop foto2" }
  ]
}

// Backend ejecuta:
await ProductImage.query().insert([
  { product_id: 1, url: "https://...", alt: "Laptop foto1" },
  { product_id: 1, url: "https://...", alt: "Laptop foto2" }
]);
```

---

### Ubicación 2: Actualizar Producto con Imágenes

**Línea 92-93:**
```javascript
if (value.images) {
  // 1. Eliminar todas las imágenes antiguas
  await ProductImage.query().delete().where('product_id', updated.id);
  
  // 2. Insertar las nuevas imágenes
  await ProductImage.query().insert(
    value.images.map(img => ({ 
      product_id: updated.id, 
      url: img.url, 
      alt: img.alt || null 
    }))
  );
}
```

**¿Qué hace?**
Cuando se actualiza un producto, reemplaza todas sus imágenes.

**Flujo:**
```
1. Admin edita producto: Laptop
2. Envía nuevas imágenes
3. Backend elimina las imágenes antiguas
4. Backend crea las nuevas imágenes
5. Retorna producto actualizado
```

**Ejemplo:**
```javascript
// Admin envía:
PUT /v1/products/1
{
  "name": "Laptop Pro",
  "images": [
    { "url": "https://nueva1.jpg", "alt": "Laptop Pro foto1" },
    { "url": "https://nueva2.jpg", "alt": "Laptop Pro foto2" }
  ]
}

// Backend ejecuta:
// 1. DELETE FROM product_images WHERE product_id = 1
// 2. INSERT INTO product_images (product_id, url, alt) VALUES (...)
```

---

### Ubicación 3: Eliminar Producto

**Línea 104:**
```javascript
await ProductImage.query().delete().where('product_id', req.params.id);
```

**¿Qué hace?**
Cuando se elimina un producto, también elimina todas sus imágenes.

**Flujo:**
```
1. Admin elimina producto: Laptop
2. Backend elimina el producto
3. Backend elimina todas sus imágenes
```

**Ejemplo:**
```javascript
// Admin envía:
DELETE /v1/products/1

// Backend ejecuta:
// 1. DELETE FROM products WHERE id = 1
// 2. DELETE FROM product_images WHERE product_id = 1
```

---

### Ubicación 4: Agregar Imagen a Producto

**Línea 143:**
```javascript
const inserted = await ProductImage.query().insert({ 
  product_id: product.id, 
  url: imageUrl, 
  alt, 
  public_id: publicId 
});
```

**¿Qué hace?**
Agrega una nueva imagen a un producto existente.

**Flujo:**
```
1. Admin presiona "Agregar imagen"
2. Selecciona imagen de la galería
3. Backend sube a Cloudinary
4. Backend crea registro en product_images
5. Retorna imagen creada
```

**Ejemplo:**
```javascript
// Admin envía:
POST /v1/products/1/images
(archivo de imagen)

// Backend ejecuta:
// 1. Sube imagen a Cloudinary
// 2. INSERT INTO product_images (product_id, url, alt, public_id) VALUES (...)
// 3. Retorna: { id: 3, url: 'https://...', alt: '...', ... }
```

---

### Ubicación 5: Obtener Imagen Específica

**Línea 153:**
```javascript
const img = await ProductImage.query().findById(req.params.imageId);
```

**¿Qué hace?**
Obtiene una imagen específica por su ID.

**Ejemplo:**
```javascript
// Obtener imagen con id = 1
const imagen = await ProductImage.query().findById(1);

console.log(imagen);
// { id: 1, product_id: 1, url: 'https://...', alt: '...', public_id: '...' }
```

---

### Ubicación 6: Eliminar Imagen

**Línea 159:**
```javascript
await ProductImage.query().deleteById(img.id);
```

**¿Qué hace?**
Elimina una imagen específica.

**Flujo:**
```
1. Admin presiona "Eliminar imagen"
2. Backend obtiene la imagen
3. Si está en Cloudinary, la elimina de ahí
4. Backend elimina el registro de la BD
```

**Ejemplo:**
```javascript
// Admin envía:
DELETE /v1/products/1/images/3

// Backend ejecuta:
// 1. Obtiene imagen con id = 3
// 2. Si tiene public_id, elimina de Cloudinary
// 3. DELETE FROM product_images WHERE id = 3
```

---

## 3️⃣ `backend/api/seeds/001_seed.js`

### ¿Qué hace?
Carga datos de prueba (imágenes de ejemplo) cuando se inicializa la BD.

### Código:
```javascript
const productImages = insertedProducts.map((product, idx) => {
  const productName = products[idx].name;
  // ... código para obtener URL de imagen ...
  return {
    product_id: product.id,
    url: imageUrl,
    alt: `${productName} image`
  };
});

await knex('product_images').insert(productImages);
```

**¿Qué hace?**
1. Para cada producto creado
2. Obtiene una imagen de Unsplash
3. Crea un registro en product_images
4. Asocia la imagen al producto

**Ejemplo:**
```
Laptop → Imagen de Unsplash → product_images
Mouse → Imagen de Unsplash → product_images
Teclado → Imagen de Unsplash → product_images
```

---

## 📊 Resumen: Dónde se Usa ProductImage

| Archivo | Línea | ¿Qué Hace? |
|---------|-------|-----------|
| **Product.js** | 10 | Define relación: 1 producto → N imágenes |
| **products.js** | 71 | Crear imágenes al crear producto |
| **products.js** | 92-93 | Actualizar imágenes al editar producto |
| **products.js** | 104 | Eliminar imágenes al eliminar producto |
| **products.js** | 143 | Agregar imagen a producto existente |
| **products.js** | 153 | Obtener imagen específica |
| **products.js** | 159 | Eliminar imagen específica |
| **001_seed.js** | 165 | Cargar imágenes de prueba |

---

## 🔄 Flujo Completo: Ciclo de Vida de una Imagen

```
┌─────────────────────────────────────────────────────────────┐
│                    1. CREAR PRODUCTO                        │
│                                                             │
│  Admin envía: POST /v1/products                            │
│  Con: { name: 'Laptop', images: [...] }                   │
│                                                             │
│  Backend:                                                   │
│  - Crea producto en tabla products                         │
│  - Crea imágenes en tabla product_images (línea 71)       │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    2. VER PRODUCTO                          │
│                                                             │
│  Cliente obtiene: GET /v1/products/1                       │
│                                                             │
│  Backend:                                                   │
│  - Obtiene producto                                        │
│  - Obtiene imágenes relacionadas (Product.js)             │
│  - Retorna: { id: 1, name: 'Laptop', images: [...] }     │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    3. AGREGAR IMAGEN                        │
│                                                             │
│  Admin envía: POST /v1/products/1/images                  │
│  Con: archivo de imagen                                    │
│                                                             │
│  Backend:                                                   │
│  - Sube imagen a Cloudinary                                │
│  - Crea registro en product_images (línea 143)            │
│  - Retorna: { id: 3, url: '...', alt: '...' }            │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    4. ACTUALIZAR PRODUCTO                   │
│                                                             │
│  Admin envía: PUT /v1/products/1                           │
│  Con: { name: 'Laptop Pro', images: [...] }              │
│                                                             │
│  Backend:                                                   │
│  - Actualiza producto                                      │
│  - Elimina imágenes antiguas (línea 92)                   │
│  - Crea nuevas imágenes (línea 93)                        │
│  - Retorna: { id: 1, name: 'Laptop Pro', images: [...] } │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    5. ELIMINAR IMAGEN                       │
│                                                             │
│  Admin envía: DELETE /v1/products/1/images/3              │
│                                                             │
│  Backend:                                                   │
│  - Obtiene imagen (línea 153)                             │
│  - Elimina de Cloudinary si existe                        │
│  - Elimina de product_images (línea 159)                  │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    6. ELIMINAR PRODUCTO                     │
│                                                             │
│  Admin envía: DELETE /v1/products/1                        │
│                                                             │
│  Backend:                                                   │
│  - Elimina producto                                        │
│  - Elimina todas sus imágenes (línea 104)                 │
│  - Elimina de Cloudinary si existen                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Resumen

**ProductImage se usa para:**

1. ✅ Definir relación entre productos e imágenes
2. ✅ Crear imágenes cuando se crea un producto
3. ✅ Actualizar imágenes cuando se edita un producto
4. ✅ Eliminar imágenes cuando se elimina un producto
5. ✅ Agregar nuevas imágenes a productos existentes
6. ✅ Obtener imágenes específicas
7. ✅ Eliminar imágenes individuales
8. ✅ Cargar datos de prueba

**En total: 8 operaciones diferentes**

