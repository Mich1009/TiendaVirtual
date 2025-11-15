const cloudinary = require('cloudinary').v2;

function isConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

function configure() {
  if (!isConfigured()) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

configure();

async function uploadBuffer(buffer, filename = 'image.jpg', folder = process.env.CLOUDINARY_FOLDER || 'tiendavirtual/products') {
  if (!isConfigured()) {
    const err = new Error('Cloudinary no configurado');
    err.code = 'NOT_CONFIGURED'; err.status = 501;
    throw err;
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, public_id: filename.replace(/\.[a-zA-Z0-9]+$/, '') }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
}

async function uploadUrl(url, folder = process.env.CLOUDINARY_FOLDER || 'tiendavirtual/products') {
  if (!isConfigured()) {
    const err = new Error('Cloudinary no configurado');
    err.code = 'NOT_CONFIGURED'; err.status = 501;
    throw err;
  }
  return cloudinary.uploader.upload(url, { folder });
}

async function deleteResource(publicId) {
  if (!isConfigured()) {
    const err = new Error('Cloudinary no configurado');
    err.code = 'NOT_CONFIGURED'; err.status = 501;
    throw err;
  }
  return cloudinary.uploader.destroy(publicId);
}

module.exports = { cloudinary, isConfigured, uploadBuffer, uploadUrl, deleteResource };