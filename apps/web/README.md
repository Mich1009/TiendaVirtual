TiendaVirtual Web

Stack
- React + Vite
- Tailwind CSS
- React Router

Env
- `VITE_API_BASE_URL` (por defecto `http://localhost:4000/v1`)

Scripts
- `npm run dev` — desarrollo
- `npm run build` — build producción
- `npm run preview` — preview del build

Estructura
- `src/pages`: Catalog, ProductDetail, Cart, Checkout, Login
- `src/components`: Navbar, Footer, ProductCard, Skeleton
- `src/lib/api.js`: cliente de API

Notas
- El login usa el endpoint `/auth/login` y guarda `accessToken` en `localStorage`.
- El checkout crea una orden en `/orders` con los items del carrito.
- Las imágenes de producto usan la primera imagen disponible (`product.images[0].url`).

Recuperación y cambio de contraseña
- Recuperación: `POST /v1/auth/forgot` genera una contraseña temporal y, si SMTP está configurado, la envía por correo usando Gmail.
- Cambio de contraseña: `POST /v1/auth/change` desde la página "Cuenta".

SMTP (Gmail)
- Configura SMTP en `.env` (ver `.env.example` en la raíz):

```
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=TU_APP_PASSWORD
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_FROM=Tienda Virtual <tu_correo@gmail.com>
```

- En desarrollo, si no se configuró SMTP, la UI mostrará la contraseña temporal devuelta por la API.