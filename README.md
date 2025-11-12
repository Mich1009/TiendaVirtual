## Tienda Virtual — Monorepo (iniciando backend)

Este proyecto aloja una app móvil (React Native), un panel admin (Next.js) y una API (Express), con PostgreSQL. Por ahora estamos iniciando el backend.

### Estructura actual
- `apps/api` → API en Express/JS.
- `infra/` → Docker Compose para PostgreSQL.

### Primeros pasos
1. Instala dependencias dentro de `apps/api` (desde la raíz puedes usar `--prefix`):
   - `npm install --prefix ./apps/api`
2. Levanta Postgres:
   - `docker compose -f infra/docker-compose.yml up -d`
3. Configura variables de entorno:
   - Copia `.env.example` a `.env` y ajusta valores.
4. Ejecuta migraciones y seed:
   - `npm run migrate --prefix ./apps/api`
   - `npm run seed --prefix ./apps/api`
5. Inicia la API:
   - `npm run dev --prefix ./apps/api`

Luego añadiremos endpoints de auth, productos, categorías, órdenes y subida de imágenes.
# TiendaVirtual