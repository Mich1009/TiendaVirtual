const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Subir imagen a Cloudinary desde base64
 * @param {string} base64Image - Imagen en formato base64
 * @param {string} folder - Carpeta en Cloudinary
 * @returns {Promise<{url: string, publicId: string}>}
 */
async function uploadImage(base64Image, folder = 'tiendavirtual/products') {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error subiendo imagen a Cloudinary:', error);
    throw new Error('Error al subir la imagen');
  }
}

/**
 * Eliminar imagen de Cloudinary
 * @param {string} publicId - ID público de la imagen en Cloudinary
 */
async function deleteImage(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log('✓ Imagen eliminada de Cloudinary:', publicId);
  } catch (error) {
    console.error('Error eliminando imagen de Cloudinary:', error);
    throw new Error('Error al eliminar la imagen');
  }
}

/**
 * Verificar si Cloudinary está configurado
 */
function isConfigured() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

module.exports = {
  uploadImage,
  deleteImage,
  isConfigured
};
