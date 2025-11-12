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