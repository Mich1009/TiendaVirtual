# Tienda Virtual API (Express + Knex/Objection)

## Requisitos
- Node.js 18+
- Docker Desktop

## Desarrollo
1. Levanta Postgres con Docker:
   ```sh
   docker compose -f infra/docker-compose.yml up -d
   ```
2. Copia `.env.example` a `.env` y ajusta valores si es necesario.
3. Ejecuta migraciones y seed:
   ```sh
   npm run migrate --prefix ./apps/api
   npm run seed --prefix ./apps/api
   ```
4. Levanta la API en desarrollo:
   ```sh
   npm run dev --prefix ./apps/api
   ```

## Endpoints base
- `GET /v1/health` → estado del servidor.

## Imágenes de productos

Configuración (opcional) con Cloudinary:
- Copia `.env.example` a `.env` y rellena:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `CLOUDINARY_FOLDER` (opcional, por defecto `tiendavirtual/products`)

Rutas:
- `POST /v1/products/:id/images` (admin):
  - Subida por archivo: `multipart/form-data` con campo `image` (máx 5MB) y `alt` opcional.
  - Subida por URL: JSON `{ "url": "https://...", "alt": "..." }`.
  - Si Cloudinary está configurado, se sube y se guarda `secure_url`; si no, se guarda la URL proporcionada.
  - Respuesta: `201 { id, url, alt }`.
- `DELETE /v1/products/:id/images/:imageId` (admin):
  - Elimina la relación `product_images` y, si existe `public_id` y Cloudinary está configurado, borra también el recurso remoto.
  - Respuesta: `204`.

Notas:
- Requiere migración adicional para `public_id` en imágenes: ejecuta `npm run migrate --prefix ./apps/api`.
- Al crear/editar productos (`POST /v1/products`, `PUT /v1/products/:id`) puedes enviar `images: [{ url, alt }]` por URL (sin `public_id`).
- `GET /v1/products/:id` retorna `images` y `category` relacionados.