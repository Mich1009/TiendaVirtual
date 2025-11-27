const BaseModel = require('./BaseModel');

class ProductImage extends BaseModel {
  static get tableName() {
    return 'product_images';
  }

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
}

module.exports = ProductImage;