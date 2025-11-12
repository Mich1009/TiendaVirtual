const BaseModel = require('./BaseModel');

class Product extends BaseModel {
  static get tableName() {
    return 'products';
  }

  static get relationMappings() {
    const Category = require('./Category');
    const ProductImage = require('./ProductImage');
    return {
      category: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Category,
        join: {
          from: 'products.category_id',
          to: 'categories.id'
        }
      },
      images: {
        relation: BaseModel.HasManyRelation,
        modelClass: ProductImage,
        join: {
          from: 'products.id',
          to: 'product_images.product_id'
        }
      }
    };
  }
}

module.exports = Product;