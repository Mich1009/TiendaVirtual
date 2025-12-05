/**
 * MODELO: ProductImage
 * 
 * ¿Qué es?
 * Un modelo que representa las imágenes de los productos.
 * Cada producto puede tener múltiples imágenes.
 * 
 * Ejemplo:
 * - Laptop tiene 3 imágenes (frontal, lateral, trasera)
 * - Mouse tiene 2 imágenes (arriba, abajo)
 * 
 * ¿Dónde se guardan?
 * En la tabla "product_images" de la base de datos
 */

// Importar la clase base que todos los modelos heredan
const BaseModel = require('./BaseModel');

/**
 * Clase ProductImage
 * 
 * Hereda de BaseModel, lo que significa que tiene:
 * - Métodos para crear, leer, actualizar, eliminar imágenes
 * - Conexión automática a la base de datos
 * - Validación de datos
 */
class ProductImage extends BaseModel {
  
  /**
   * tableName()
   * 
   * ¿Qué hace?
   * Define el nombre de la tabla en la base de datos
   * 
   * ¿Por qué?
   * El modelo necesita saber en qué tabla guardar/obtener los datos
   * 
   * Tabla en BD:
   * ┌──────────────────────────────────────────────────┐
   * │ product_images                                   │
   * ├────┬────────────┬──────────────────┬──────────────┤
   * │ id │ product_id │ url              │ alt          │
   * ├────┼────────────┼──────────────────┼──────────────┤
   * │ 1  │ 1          │ https://...jpg   │ Laptop foto1 │
   * │ 2  │ 1          │ https://...jpg   │ Laptop foto2 │
   * │ 3  │ 2          │ https://...jpg   │ Mouse foto1  │
   * └────┴────────────┴──────────────────┴──────────────┘
   */
  static get tableName() {
    return 'product_images';
  }

  /**
   * relationMappings()
   * 
   * ¿Qué hace?
   * Define las relaciones entre tablas (cómo se conectan los datos)
   * 
   * ¿Por qué?
   * Porque una imagen pertenece a UN producto
   * Y un producto puede tener MUCHAS imágenes
   * 
   * Relación:
   * ┌──────────────┐         ┌──────────────────┐
   * │   products   │         │ product_images   │
   * ├──────────────┤         ├──────────────────┤
   * │ id: 1        │ ◄─────► │ id: 1            │
   * │ name: Laptop │ 1 a N   │ product_id: 1    │
   * │              │         │ url: https://... │
   * │              │         ├──────────────────┤
   * │              │         │ id: 2            │
   * │              │         │ product_id: 1    │
   * │              │         │ url: https://... │
   * └──────────────┘         └──────────────────┘
   * 
   * Un producto (1) tiene muchas imágenes (N)
   */
  static get relationMappings() {
    // Importar el modelo Product
    const Product = require('./Product');
    
    // Retornar objeto con las relaciones
    return {
      /**
       * product: { ... }
       * 
       * ¿Qué es "product"?
       * El nombre de la relación. Permite acceder así:
       * 
       * const imagen = await ProductImage.query().findById(1).withGraphFetched('product');
       * console.log(imagen.product.name);  // "Laptop"
       */
      product: {
        /**
         * relation: BaseModel.BelongsToOneRelation
         * 
         * ¿Qué significa?
         * "BelongsToOne" = "Pertenece a uno"
         * 
         * Traducción:
         * "Una imagen pertenece a UN producto"
         * 
         * Ejemplo:
         * - Imagen 1 pertenece al producto Laptop
         * - Imagen 2 pertenece al producto Laptop
         * - Imagen 3 pertenece al producto Mouse
         */
        relation: BaseModel.BelongsToOneRelation,
        
        /**
         * modelClass: Product
         * 
         * ¿Qué es?
         * La clase del modelo relacionado (Product)
         * 
         * ¿Por qué?
         * Para saber qué modelo usar cuando se obtiene la relación
         */
        modelClass: Product,
        
        /**
         * join: { ... }
         * 
         * ¿Qué hace?
         * Define CÓMO conectar las dos tablas
         * 
         * Es como un puente entre:
         * - product_images.product_id (la llave foránea)
         * - products.id (la llave primaria)
         */
        join: {
          /**
           * from: 'product_images.product_id'
           * 
           * ¿Qué es?
           * La columna en la tabla product_images que contiene el ID del producto
           * 
           * Ejemplo:
           * product_images.product_id = 1
           * (Esta imagen pertenece al producto con id = 1)
           */
          from: 'product_images.product_id',
          
          /**
           * to: 'products.id'
           * 
           * ¿Qué es?
           * La columna en la tabla products que coincide
           * 
           * Ejemplo:
           * products.id = 1
           * (El producto con id = 1)
           */
          to: 'products.id'
        }
      }
    };
  }
}

/**
 * Exportar el modelo
 * 
 * ¿Qué significa?
 * Permite que otros archivos usen este modelo
 * 
 * Ejemplo de uso:
 * const ProductImage = require('./ProductImage');
 * const imagen = await ProductImage.query().findById(1);
 */
module.exports = ProductImage;