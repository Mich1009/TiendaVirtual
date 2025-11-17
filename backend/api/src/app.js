const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes');
const { errorHandler } = require('./middlewares/error');

const app = express();

// Middlewares base
app.use(helmet());
app.use(cors({ origin: '*'}));
// Aumentar límite para permitir imágenes más grandes (5MB)
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(morgan('dev'));

// Rutas
app.use('/v1', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler (debe ir al final)
app.use(errorHandler);

module.exports = app;