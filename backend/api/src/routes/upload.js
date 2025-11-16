const { Router } = require('express');
const { authRequired, adminOnly } = require('../middlewares/auth');
const { uploadImage, deleteImage, isConfigured } = require('../services/cloudinary');

const router = Router();

/**
 * POST /v1/upload/image
 * Subir imagen a Cloudinary (solo admin)
 * Body: { image: "data:image/jpeg;base64,..." }
 */
router.post('/image', authRequired, adminOnly, async (req, res, next) => {
  try {
    // Verificar que Cloudinary esté configurado
    if (!isConfigured()) {
      return res.status(503).json({ 
        error: 'Servicio de imágenes no configurado. Configura las variables CLOUDINARY_* en .env' 
      });
    }

    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Se requiere una imagen en base64' });
    }

    // Validar que sea base64
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Formato de imagen inválido. Debe ser base64' });
    }

    // Subir a Cloudinary
    const result = await uploadImage(image);

    res.json({
      url: result.url,
      publicId: result.publicId
    });
  } catch (error) {
    console.error('Error en upload:', error);
    next(error);
  }
});

/**
 * DELETE /v1/upload/image/:publicId
 * Eliminar imagen de Cloudinary (solo admin)
 */
router.delete('/image/:publicId(*)', authRequired, adminOnly, async (req, res, next) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({ 
        error: 'Servicio de imágenes no configurado' 
      });
    }

    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({ error: 'Se requiere el publicId de la imagen' });
    }

    await deleteImage(publicId);

    res.json({ message: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    next(error);
  }
});

/**
 * GET /v1/upload/status
 * Verificar si el servicio de imágenes está configurado
 */
router.get('/status', (req, res) => {
  res.json({
    configured: isConfigured(),
    message: isConfigured() 
      ? 'Servicio de imágenes configurado correctamente' 
      : 'Configura las variables CLOUDINARY_* en .env para habilitar la subida de imágenes'
  });
});

module.exports = router;
