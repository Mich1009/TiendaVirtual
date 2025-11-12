require('dotenv').config();
const app = require('./app');
// Inicializa conexión a DB (Knex/Objection)
require('./db/knex');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});