# 📦 Modelos Explicados - ProductImage

## 🎯 ¿Qué es un Modelo?

Un modelo es una clase que representa una tabla de la base de datos.

**Ejemplo:**
- Tabla `products` → Modelo `Product`
- Tabla `product_images` → Modelo `ProductImage`
- Tabla `users` → Modelo `User`

---

## 📍 Archivo: `backend/api/src/models/ProductImage.js`

### Estructura General

```javascript
const BaseModel = require('./BaseModel');

class ProductImage extends BaseModel {
  // Aquí va el código
}

module.exports = ProductImage;
```

---

## 🔍 Explicación Línea por Línea

### Parte 1: Importar BaseModel

```javascript
const BaseModel = require('./BaseModel');
```

**¿Qué hace?**
Importa la clase base que todos los modelos heredan.

**¿Por qué?**
Porque ProductImage necesita heredar métodos para:
- Crear imágenes: `ProductImage.query().insert(...)`
- Leer imágenes: `ProductImage.query().findById(1)`
- Actualizar imágenes: `ProductImage.query().patchAndFetchById(1, {...})`
- Eliminar imágenes: `ProductImage.query().deleteById(1)`

---

### Parte 2: Crear la Clase

```javascript
class ProductImage extends BaseModel {
  // ...
}
```

**¿Qué significa?**
- `class ProductImage` → Crear una clase llamada ProductImage
- `extends BaseModel` → Hereda de BaseModel (obtiene todos sus métodos)

**Analogía:**
```
BaseModel es como un "molde" que tiene:
- Métodos para conectar a BD
- Métodos para crear/leer/actualizar/eliminar
- Validación de datos

ProductImage "extiende" ese molde:
- Obtiene todos los métodos de BaseModel
- Agrega su propia configuración específica
```

---

### Parte 3: Definir la Tabla

```javascript
static get tableName() {
  return 'product_images';
}
```

**¿Qué hace?**
Define el nombre de la tabla en la base de datos.

**¿Por qué?**
El modelo necesita saber en qué tabla guardar/obtener los datos.

**Tabla en BD:**
```
product_images
┌────┬────────────┬──────────────────┬──────────────┐
│ id │ product_id │ url              │ alt          │
├────┼────────────┼──────────────────┼──────────────┤
│ 1  │ 1          │ https://...jpg   │ Laptop foto1 │
│ 2  │ 1          │ https://...jpg   │ Laptop foto2 │
│ 3  │ 2          │ https://...jpg   │ Mouse foto1  │
└────┴────────────┴──────────────────┴──────────────┘
```

**Columnas:**
- `id` - Identificador único de la imagen
- `product_id` - ID del producto al que pertenece
- `url` - URL de la imagen
- `alt` - Texto alternativo (para accesibilidad)

---

### Parte 4: Definir Relaciones

```javascript
static get relationMappings() {
  const Product = require('./Product');
  return {
    product: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: Product,
      join: {
        from: 'product_images.product_id',
        to: 'products.id'
      }
    }
  };
}
```

**¿Qué hace?**
Define cómo se conecta ProductImage con Product.

**¿Por qué?**
Porque una imagen pertenece a UN producto, y un producto puede tener MUCHAS imágenes.

---

## 🔗 Relación: Una Imagen Pertenece a Un Producto

### Visualización

```
TABLA: products
┌────┬─────────┐
│ id │ name    │
├────┼─────────┤
│ 1  │ Laptop  │ ◄─────┐
│ 2  │ Mouse   │ ◄──┐  │
└────┴─────────┘    │  │
                    │  │
TABLA: product_images
┌────┬────────────┬──────────────────┐
│ id │ product_id │ url              │
├────┼────────────┼──────────────────┤
│ 1  │ 1          │ https://...jpg   │ ─┘
│ 2  │ 1          │ https://...jpg   │ ─┘
│ 3  │ 2          │ https://...jpg   │ ─┐
└────┴────────────┴──────────────────┘   │
                                         │
Imagen 1 pertenece a Laptop (id=1)      │
Imagen 2 pertenece a Laptop (id=1)      │
Imagen 3 pertenece a Mouse (id=2) ──────┘
```

---

## 📝 Desglose de relationMappings()

### 1. Importar Product

```javascript
const Product = require('./Product');
```

**¿Qué hace?**
Importa el modelo Product para poder usarlo en la relación.

---

### 2. Definir el Nombre de la Relación

```javascript
product: {
  // ...
}
```

**¿Qué es "product"?**
El nombre de la relación. Permite acceder así:

```javascript
// Obtener una imagen con su producto relacionado
const imagen = await ProductImage.query()
  .findById(1)
  .withGraphFetched('product');

console.log(imagen.product.name);  // "Laptop"
```

---

### 3. Tipo de Relación

```javascript
relation: BaseModel.BelongsToOneRelation,
```

**¿Qué significa?**
`BelongsToOne` = "Pertenece a uno"

**Traducción:**
"Una imagen pertenece a UN producto"

**Ejemplo:**
```
- Imagen 1 pertenece al producto Laptop
- Imagen 2 pertenece al producto Laptop
- Imagen 3 pertenece al producto Mouse
```

---

### 4. Modelo Relacionado

```javascript
modelClass: Product,
```

**¿Qué es?**
La clase del modelo relacionado (Product).

**¿Por qué?**
Para saber qué modelo usar cuando se obtiene la relación.

---

### 5. Cómo Conectar las Tablas

```javascript
join: {
  from: 'product_images.product_id',
  to: 'products.id'
}
```

**¿Qué hace?**
Define el "puente" entre las dos tablas.

**Traducción:**
"Conecta `product_images.product_id` con `products.id`"

**Ejemplo:**
```
product_images.product_id = 1
        ↓
        Busca en products donde id = 1
        ↓
products.id = 1 (Laptop)
```

---

## 💡 Cómo se Usa en la Práctica

### Ejemplo 1: Obtener una Imagen

```javascript
// Obtener imagen con id = 1
const imagen = await ProductImage.query().findById(1);

console.log(imagen);
// {
//   id: 1,
//   product_id: 1,
//   url: 'https://...',
//   alt: 'Laptop foto1'
// }
```

---

### Ejemplo 2: Obtener Imagen con su Producto

```javascript
// Obtener imagen con su producto relacionado
const imagen = await ProductImage.query()
  .findById(1)
  .withGraphFetched('product');

console.log(imagen);
// {
//   id: 1,
//   product_id: 1,
//   url: 'https://...',
//   alt: 'Laptop foto1',
//   product: {
//     id: 1,
//     name: 'Laptop',
//     price: 999.99,
//     ...
//   }
// }

console.log(imagen.product.name);  // "Laptop"
```

---

### Ejemplo 3: Obtener Todas las Imágenes de un Producto

```javascript
// Obtener todas las imágenes del producto con id = 1
const imagenes = await ProductImage.query()
  .where('product_id', 1);

console.log(imagenes);
// [
//   { id: 1, product_id: 1, url: 'https://...', alt: 'Laptop foto1' },
//   { id: 2, product_id: 1, url: 'https://...', alt: 'Laptop foto2' }
// ]
```

---

### Ejemplo 4: Crear una Nueva Imagen

```javascript
// Crear una nueva imagen para el producto Laptop
const nuevaImagen = await ProductImage.query().insert({
  product_id: 1,
  url: 'https://example.com/laptop-foto3.jpg',
  alt: 'Laptop foto3'
});

console.log(nuevaImagen);
// {
//   id: 3,
//   product_id: 1,
//   url: 'https://example.com/laptop-foto3.jpg',
//   alt: 'Laptop foto3'
// }
```

---

### Ejemplo 5: Eliminar una Imagen

```javascript
// Eliminar la imagen con id = 1
await ProductImage.query().deleteById(1);

console.log('✅ Imagen eliminada');
```

---

## 🔄 Flujo Completo: Agregar Imagen a un Producto

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN EN LA APP                          │
│                                                             │
│  1. Va a: Productos → Editar Laptop                        │
│  2. Presiona: "Agregar imagen"                             │
│  3. Selecciona imagen de la galería                        │
│  4. Presiona: "Guardar"                                    │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND                                 │
│                                                             │
│  Envía: POST /v1/products/1/images                         │
│  Con: archivo de imagen                                    │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND                                  │
│                                                             │
│  1. Recibe la imagen                                        │
│  2. Sube a Cloudinary (servicio de imágenes)              │
│  3. Obtiene URL de la imagen                               │
│  4. Crea registro en product_images:                        │
│                                                             │
│     ProductImage.query().insert({                           │
│       product_id: 1,                                        │
│       url: 'https://cloudinary.com/...',                   │
│       alt: 'Laptop foto'                                   │
│     })                                                      │
│                                                             │
│  5. Retorna: { id: 3, product_id: 1, url: '...', ... }   │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS                            │
│                                                             │
│  INSERT INTO product_images                                │
│  (product_id, url, alt)                                    │
│  VALUES (1, 'https://...', 'Laptop foto')                 │
│                                                             │
│  Tabla product_images:                                      │
│  ┌────┬────────────┬──────────────────┐                    │
│  │ id │ product_id │ url              │                    │
│  ├────┼────────────┼──────────────────┤                    │
│  │ 1  │ 1          │ https://...jpg   │                    │
│  │ 2  │ 1          │ https://...jpg   │                    │
│  │ 3  │ 1          │ https://...jpg   │ ← Nueva            │
│  └────┴────────────┴──────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTES EN LA APP                       │
│                                                             │
│  Ven el producto Laptop con 3 imágenes                     │
│  Pueden hacer scroll entre las imágenes                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Resumen

| Aspecto | Explicación |
|---------|-------------|
| **¿Qué es?** | Modelo que representa la tabla `product_images` |
| **¿Para qué?** | Guardar y gestionar imágenes de productos |
| **Relación** | Una imagen pertenece a UN producto |
| **Tabla** | `product_images` con columnas: id, product_id, url, alt |
| **Métodos** | Crear, leer, actualizar, eliminar imágenes |
| **Uso** | `ProductImage.query().findById(1)` |

