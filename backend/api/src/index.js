require('dotenv').config();
const app = require('./app');
// Inicializa conexión a DB (Knex/Objection)
require('./db/knex');

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`API escuchando en http://${HOST}:${PORT}`);
});