function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Unexpected error';

  if (process.env.NODE_ENV !== 'test') {
    // Log simple error; en producción podría integrarse con un logger
    console.error(`[ERROR] ${status} ${code}:`, err);
  }

  res.status(status).json({ error: { code, message } });
}

module.exports = { errorHandler };