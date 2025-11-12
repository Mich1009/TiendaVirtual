const BaseModel = require('./BaseModel');

class ProductImage extends BaseModel {
  static get tableName() {
    return 'product_images';
  }
}

module.exports = ProductImage;