# 🛒 TiendaVirtual - Aplicación de E-commerce Full Stack

Una aplicación de tienda virtual completa construida con **React Native**, **Expo**, **Express.js** y **PostgreSQL**. Funciona en web, iOS y Android con un panel de administración integrado.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Funcionalidades](#funcionalidades)
- [Usuarios de Prueba](#usuarios-de-prueba)
- [Troubleshooting](#troubleshooting)

## ✨ Características

- ✅ **Catálogo de Productos**: 30 productos en 5 categorías con imágenes
- ✅ **Carrito de Compras**: Agregar/quitar productos con persistencia
- ✅ **Sistema de Autenticación**: Login y registro con JWT
- ✅ **Checkout**: Proceso de compra completo
- ✅ **Panel de Administración**: Gestionar productos, categorías, usuarios y pedidos
- ✅ **Gestión de Pedidos**: Seguimiento de estado de entregas
- ✅ **Multiplataforma**: Web, iOS y Android desde el mismo código
- ✅ **Base de Datos**: PostgreSQL con migraciones automáticas
- ✅ **Datos de Prueba**: Seeder con 30 productos y usuarios demo

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React Native)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Expo Router - Navegación                            │  │
│  │  Context API - Estado global (Carrito, Auth)         │  │
│  │  TypeScript - Type safety                            │  │
│  │  Soporta: Web, iOS, Android                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
                    (HTTP REST API)
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express.js - Framework web                         │  │
│  │  Knex.js - Query builder y migraciones              │  │
│  │  Objection.js - ORM                                 │  │
│  │  JWT - Autenticación                                │  │
│  │  Bcryptjs - Encriptación de contraseñas             │  │
│  │  Cloudinary - Almacenamiento de imágenes            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL                                          │  │
│  │  Tablas: users, products, categories, orders, etc   │  │
│  │  Migraciones automáticas                            │  │
│  │  Seeder con datos de prueba                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Requisitos Previos

- **Node.js** v18+ ([Descargar](https://nodejs.org/))
- **NPM** (incluido con Node.js)
- **PostgreSQL** 12+ ([Descargar](https://www.postgresql.org/))
- **Git** para clonar el repositorio

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone <tu-repositorio>
cd TiendaVirtual
```

### 2. Instalar Dependencias del Backend

```bash
cd backend/api
npm install
```

### 3. Instalar Dependencias del Frontend

```bash
cd frontend
npm install
```

## ⚙️ Configuración

### Backend - Variables de Entorno

Crea un archivo `.env` en `backend/api/`:

```env
# Puerto del servidor
PORT=4000
HOST=0.0.0.0

# Base de datos PostgreSQL
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=tu_contraseña
PGDATABASE=tiendavirtual

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura

# Cloudinary (opcional, para subida de imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Email (opcional, para notificaciones)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_contraseña_app
```

### Frontend - Variables de Entorno

Crea un archivo `.env` en `frontend/`:

```env
EXPO_PUBLIC_API_URL=http://tu_ip_local:4000/v1
```

Reemplaza `tu_ip_local` con la IP de tu máquina (ej: `192.168.1.100`)

## ▶️ Ejecución

### Opción Recomendada: Ejecutar en Dos Terminales

Abre **dos terminales** diferentes:

**Terminal 1 - Backend:**
```bash
npm run backend
```
Espera a que veas: `🚀 API en http://0.0.0.0:4000`

**Terminal 2 - Frontend:**
```bash
npm run frontend
```
Escanea el QR con tu celular o emulador

**Para detener**: Presiona `Ctrl+C` en cada terminal

### Cargar Datos de Prueba (Primera Vez)

Para cargar los 30 productos de prueba:

```bash
npm run db:setup
```

**⚠️ Importante**: Solo ejecuta esto la primera vez. Después, los cambios que hagas en la BD se preservarán.

## 📁 Estructura del Proyecto

```
TiendaVirtual/
├── backend/
│   └── api/
│       ├── src/
│       │   ├── index.js              # Punto de entrada del servidor
│       │   ├── app.js                # Configuración de Express
│       │   ├── db/
│       │   │   └── knex.js           # Configuración de BD
│       │   ├── routes/               # Rutas de la API
│       │   │   ├── auth.js           # Autenticación
│       │   │   ├── products.js       # Productos
│       │   │   ├── categories.js     # Categorías
│       │   │   ├── orders.js         # Pedidos
│       │   │   └── ...
│       │   ├── models/               # Modelos ORM
│       │   ├── middlewares/          # Middlewares
│       │   ├── services/             # Servicios (Cloudinary, etc)
│       │   ├── validation/           # Validación de datos
│       │   └── jobs/                 # Tareas programadas
│       ├── migrations/               # Migraciones de BD
│       ├── seeds/                    # Datos iniciales
│       ├── knexfile.js               # Configuración de Knex
│       └── package.json
├── frontend/
│   ├── app/
│   │   ├── index.tsx                 # Pantalla raíz
│   │   ├── (tabs)/                   # Navegación con tabs
│   │   │   ├── catalog.tsx           # Catálogo de productos
│   │   │   ├── cart.tsx              # Carrito
│   │   │   ├── orders.tsx            # Mis pedidos
│   │   │   └── profile.tsx           # Perfil
│   │   ├── login.tsx                 # Login
│   │   ├── register.tsx              # Registro
│   │   ├── checkout.tsx              # Checkout
│   │   └── ...
│   ├── components/                   # Componentes reutilizables
│   ├── context/                      # Context API
│   │   ├── CartContext.tsx           # Estado del carrito
│   │   └── AppConfigContext.tsx      # Configuración global
│   ├── lib/                          # Utilidades
│   │   ├── api.ts                    # Cliente HTTP
│   │   ├── auth.ts                   # Autenticación
│   │   └── ...
│   ├── constants/                    # Constantes
│   └── package.json
└── README.md
```

## 🎯 Funcionalidades

### Para Clientes

1. **Explorar Catálogo**
   - Ver 30 productos en 5 categorías
   - Filtrar por categoría
   - Ver detalles del producto

2. **Carrito de Compras**
   - Agregar/quitar productos
   - Modificar cantidades
   - Ver total

3. **Checkout**
   - Ingresar dirección de envío
   - Seleccionar método de pago
   - Confirmar pedido

4. **Mis Pedidos**
   - Ver historial de compras
   - Seguimiento de estado
   - Ver detalles de pedidos

5. **Perfil**
   - Ver información personal
   - Cambiar contraseña
   - Cerrar sesión

### Para Administradores

1. **Gestión de Productos**
   - Crear, editar, eliminar productos
   - Subir imágenes
   - Gestionar stock

2. **Gestión de Categorías**
   - Crear, editar, eliminar categorías
   - Asignar productos a categorías

3. **Gestión de Usuarios**
   - Ver lista de usuarios
   - Cambiar roles
   - Desactivar usuarios

4. **Gestión de Pedidos**
   - Ver todos los pedidos
   - Cambiar estado de pedidos
   - Ver detalles de compra

5. **Configuración de Tienda**
   - Nombre de la tienda
   - Descripción
   - Configuración general

## 👥 Usuarios de Prueba

### Cliente
- **Email**: `cliente@tienda.com`
- **Contraseña**: `cliente123`

### Administrador
- **Email**: `admin@tienda.com`
- **Contraseña**: `admin123`

## 🔧 Comandos Útiles

### Desde la Raíz del Proyecto

```bash
# Iniciar backend
npm run backend

# Iniciar frontend
npm run frontend

# Configurar BD (migraciones + seeder)
npm run db:setup
```

### Backend (en backend/api/)

```bash
npm run dev          # Iniciar en desarrollo
npm run migrate      # Ejecutar migraciones
npm run seed         # Cargar datos de prueba
npm run db:setup     # Migraciones + seeder
npm run db:create    # Crear base de datos
npm run rollback     # Revertir última migración
```

### Frontend (en frontend/)

```bash
npx expo start --lan # Iniciar con LAN
npx expo start --web # Iniciar en web

# Limpiar caché de Expo
npm start -- --clear

# Recarga en caliente (presionar 'r' en terminal)
```

## 🐛 Troubleshooting

### Error: "Network request failed" o "No se pudo cargar desde backend"

**Causa**: La URL del backend es incorrecta o el backend no está corriendo

**Solución**:
1. Verifica que el backend está corriendo: `npm run backend`
2. Obtén tu IP local: `ipconfig` (busca "Dirección IPv4" en WiFi)
3. Actualiza `frontend/.env`:
   ```
   EXPO_PUBLIC_API_URL=http://TU_IP:4000/v1
   ```
4. Recarga la app de Expo (presiona `r` en la terminal)

### Error: "Port 4000 is already in use"

**Solución**:
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :4000
kill -9 <PID>
```

### Error: "Database connection failed"

**Solución**:
1. Verifica que PostgreSQL está corriendo
2. Verifica credenciales en `.env`
3. Verifica que la BD existe: `createdb tiendavirtual`

### Las imágenes no se cargan

**Solución**:
1. Verifica conexión a internet (Unsplash requiere conexión)
2. Limpia caché: `npm start -c`
3. Verifica URLs en `backend/api/seeds/001_seed.js`

### Cambios de código no aparecen

**Solución**:
- Presiona `r` en la terminal del frontend para recargar
- O presiona `Ctrl+C` y ejecuta `npm run frontend` nuevamente

### No puedo presionar Ctrl+C para cerrar

**Solución**:
- Presiona `Ctrl+C` dos veces seguidas
- O cierra la terminal directamente

## 📊 Estadísticas del Proyecto

- **Líneas de Código**: ~5000+
- **Componentes**: 20+
- **Rutas API**: 30+
- **Modelos de BD**: 7
- **Migraciones**: 5
- **Productos de Prueba**: 30
- **Categorías**: 5

## 🔐 Seguridad

- ✅ Contraseñas encriptadas con bcryptjs
- ✅ Autenticación con JWT
- ✅ CORS configurado
- ✅ Helmet para headers de seguridad
- ✅ Validación de entrada con Joi
- ✅ Rate limiting (recomendado para producción)

## 📝 Notas de Desarrollo

### Modo de Prueba vs Producción

El backend está configurado en **MODO PRUEBA** para testing rápido:
- Los pedidos se marcan como entregados cada **5 minutos**
- Para cambiar a producción, edita `backend/api/src/index.js` línea 60

### Imágenes de Productos

Las imágenes vienen de **Unsplash** (servicio gratuito):
- Requiere conexión a internet
- URLs verificadas y funcionales
- Cada producto tiene una imagen específica

### Base de Datos

- Migraciones automáticas al iniciar
- Seeder automático si la BD está vacía
- Datos de prueba incluidos

## 🚀 Próximas Mejoras

- [ ] Integración de pasarela de pago real
- [ ] Sistema de notificaciones por email
- [ ] Búsqueda y filtros avanzados
- [ ] Reseñas y calificaciones de productos
- [ ] Wishlist/Favoritos
- [ ] Cupones y descuentos
- [ ] Análisis y reportes para admin
- [ ] Soporte multiidioma

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs en la terminal
2. Abre DevTools en el navegador (F12)
3. Verifica la conexión a la BD
4. Prueba la API directamente: `http://localhost:4000/v1/products`

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

**Última actualización**: Noviembre 27, 2025  
**Versión**: 1.0.0  
**Estado**: ✅ Funcional y listo para producción

¡Disfruta tu TiendaVirtual! 🛍️
