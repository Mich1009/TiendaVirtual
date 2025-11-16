# 🛍️ Tienda Virtual - Aplicación Móvil

Aplicación móvil completa de comercio electrónico con diseño inspirado en **Falabella**, desarrollada con **React Native** y **Expo**.

---

## ✨ Características

- 🎨 **Diseño Profesional** - Inspirado en Falabella con colores corporativos (#00A650)
- 🛒 **Carrito de Compras** - Gestión completa de productos con persistencia
- 🔍 **Búsqueda y Filtros** - Búsqueda en tiempo real y filtrado por categorías
- 🔐 **Autenticación con Roles** - Sistema de login con JWT y dos roles:
  - **CUSTOMER**: Cliente normal (puede comprar y ver sus pedidos)
  - **ADMIN**: Administrador (acceso completo al sistema)
- ⚙️ **Panel de Administrador** ⭐ NUEVO - Configuración personalizada de la tienda:
  - 🖼️ Subir y gestionar logo de la aplicación
  - ✏️ Cambiar nombre de la tienda
  - 🔤 Personalizar tipo de letra
  - 🔒 Gestión de contraseña del admin
- 💳 **Checkout** - Proceso de compra completo con validación
- 📦 **Historial de Pedidos** - Seguimiento de todas tus compras
- 👤 **Perfil de Usuario** - Gestión de datos personales, dirección y contraseña
- 📱 **Compatible con Expo Go** - Prueba en tu dispositivo al instante

---

## 🚀 Inicio Rápido

### Requisitos Previos

1. **Node.js v18 o superior** - [Descargar aquí](https://nodejs.org/)
2. **Expo Go** en tu dispositivo móvil:
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android - Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### ⚡ Instalación y Configuración (Solo la Primera Vez)

```bash
# 1. Clonar el repositorio
git clone <tu-repositorio>
cd TiendaVirtual

# 2. Instalar todas las dependencias
npm install
cd backend/api && npm install
cd ../../frontend && npm install
cd ..

# 3. Configurar base de datos
# Copia .env.example a .env en backend/api y configura las variables
cp backend/api/.env.example backend/api/.env

# 4. Ejecutar migraciones y seed
npm run migrate
npm run seed

# 5. Configurar IP del frontend
cd frontend
npm run detect-ip
cd ..
```

### 🎯 Iniciar la Aplicación (Un Solo Comando)

```bash
# Desde la raíz del proyecto
npm start
```

Este comando iniciará automáticamente:
1. 🔵 **Backend** (API en puerto 4000) - Se inicia primero
2. ⏳ **Espera** - Verifica que el backend esté listo (máx. 30 segundos)
3. 🟣 **Frontend** (Expo con código QR) - Se inicia cuando el backend responde

Verás algo como:
```
[1/3] Iniciando Backend...
[2/3] Esperando a que el backend esté listo...
✓ Backend listo en http://localhost:4000
[3/3] Iniciando Frontend...
```

Luego:
1. Abre **Expo Go** en tu dispositivo móvil
2. Escanea el **código QR** que aparece en la terminal
3. ¡Listo! 🎉



---

## 🔑 Credenciales de Prueba

Para probar la aplicación, usa estas credenciales:

### Administrador (NO puede comprar, solo gestionar)
```
Email: admin@tienda.com
Contraseña: admin123
Rol: ADMIN
```
**Funciones:** 
- Dashboard con estadísticas
- Gestionar Productos
- Gestionar Órdenes
- ⭐ **Configuración de la Tienda** (Logo, Nombre, Fuente)

### Cliente (Puede comprar productos)
```
Email: cliente@tienda.com
Contraseña: cliente123
Rol: CUSTOMER
```
**Funciones:** Ver Catálogo, Comprar, Ver sus Pedidos



---

## 📁 Estructura del Proyecto

```
TiendaVirtual/
├── frontend/              # Aplicación móvil (React Native + Expo)
│   ├── app/              # Pantallas y navegación
│   │   └── (tabs)/       # Navegación por pestañas
│   │       ├── catalog.tsx           # Catálogo de productos
│   │       ├── cart.tsx              # Carrito de compras
│   │       ├── perfil.tsx            # Perfil de usuario
│   │       ├── admin-dashboard.tsx   # Dashboard admin
│   │       ├── admin-products.tsx    # Gestión de productos
│   │       ├── admin-orders.tsx      # Gestión de órdenes
│   │       └── admin-settings.tsx    # Configuración ⭐ NUEVO
│   ├── components/       # Componentes reutilizables
│   ├── constants/        # Colores y temas
│   ├── context/          # Estado global (Context API)
│   │   ├── CartContext.tsx           # Carrito de compras
│   │   └── AppConfigContext.tsx      # Configuración de la app
│   ├── lib/              # API y autenticación
│   └── scripts/          # Scripts de utilidad
├── backend/              # API REST (Express + PostgreSQL)
│   └── api/             # Código del servidor
├── infra/               # Docker Compose para PostgreSQL
└── docs/                # Documentación
```

---

## 🎨 Diseño

### Colores Corporativos (Falabella)
- **Verde Principal**: #00A650
- **Amarillo Secundario**: #FFB800
- **Fondo**: #FFFFFF / #F5F5F5
- **Texto**: #333333 / #666666

### Pantallas

#### Para Clientes
1. **Catálogo** - Lista de productos con búsqueda y filtros
2. **Carrito** - Gestión de productos seleccionados
3. **Perfil** - Configuración completa de usuario
4. **Detalle** - Información completa del producto
5. **Login/Registro** - Autenticación de usuarios
6. **Checkout** - Proceso de compra
7. **Pedidos** - Historial de compras

#### Para Administradores
1. **Dashboard** - Estadísticas y métricas
2. **Productos** - Gestión de productos (CRUD)
3. **Órdenes** - Gestión de pedidos
4. **Configuración** ⭐ NUEVO - Personalización de la tienda
5. **Perfil** - Información básica del admin

---

## 🔧 Tecnologías

### Frontend (Móvil)
- **Expo SDK 54** - Framework de desarrollo
- **React Native 0.81** - UI nativa
- **Expo Router 6** - Navegación basada en archivos
- **TypeScript** - Tipado estático para mayor seguridad
- **AsyncStorage** - Persistencia local de datos
- **Context API** - Gestión de estado global
- **Expo Image Picker** - Selector de imágenes

### Backend (API REST)
- **Express.js** - Framework web minimalista
- **PostgreSQL** - Base de datos relacional
- **Knex.js** - Query builder y migraciones
- **JWT** - Autenticación basada en tokens
- **Bcrypt** - Encriptación de contraseñas
- **Cloudinary** - Almacenamiento de imágenes (opcional)

---

## 🛠️ Scripts Disponibles

### Desde la Raíz del Proyecto

```bash
npm start              # Iniciar backend primero, luego frontend ⭐ RECOMENDADO
npm run start:backend  # Iniciar solo el backend
npm run start:frontend # Iniciar solo el frontend
npm run start:both     # Iniciar ambos en paralelo (para debugging)
npm run migrate        # Ejecutar migraciones de base de datos
npm run seed           # Poblar base de datos con datos de prueba
```

### Frontend (desde frontend/)

```bash
npm start           # Iniciar servidor de desarrollo Expo
npm run detect-ip   # Detectar IP local y configurar automáticamente
npm run verify      # Verificar que todo esté configurado correctamente
npm run android     # Abrir en emulador/dispositivo Android
npm run ios         # Abrir en simulador/dispositivo iOS
npm run lint        # Ejecutar ESLint para verificar código
```

### Backend (desde backend/api/)

```bash
npm run dev         # Iniciar servidor en modo desarrollo (con nodemon)
npm run start       # Iniciar servidor en modo producción
npm run migrate     # Ejecutar migraciones de base de datos
npm run rollback    # Revertir última migración
npm run seed        # Poblar base de datos con datos de prueba
```

---

## 🔐 Configuración del Backend

### Variables de Entorno

Crea un archivo `.env` en `backend/api/` basado en `.env.example`:

```env
# Base de datos PostgreSQL
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/tienda_virtual

# JWT para autenticación
JWT_SECRET=tu_secreto_super_seguro_aqui

# Puerto del servidor
PORT=4000

# Cloudinary (opcional, para subir imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Inicializar Base de Datos

```bash
# Desde la raíz del proyecto
npm run migrate
npm run seed
```

---

## 📱 Configuración del Frontend

### Configurar IP del Backend

**Opción 1: Automática (Recomendado)**
```bash
cd frontend
npm run detect-ip
```

**Opción 2: Manual**

Edita `frontend/app.json`:
```json
{
  "expo": {
    "extra": {
      "API_URL": "http://TU_IP_LOCAL:4000/v1"
    }
  }
}
```

Para encontrar tu IP:
- **Windows:** `ipconfig` (busca "Dirección IPv4" en Wi-Fi)
- **Mac/Linux:** `ifconfig` o `ip addr`

---

## 🐛 Solución de Problemas

### 1. Error "Network Request Failed"

**Causa:** La app no puede conectarse al backend.

**Solución:**
```bash
# 1. Verifica que el backend esté corriendo
npm run start:backend

# 2. Configura la IP correcta
cd frontend
npm run detect-ip

# 3. Reinicia desde la raíz
cd ..
npm start
```



### 2. Backend no inicia

**Causa:** Base de datos no configurada o error en variables de entorno.

**Solución:**
1. Verifica que PostgreSQL esté corriendo
2. Revisa el archivo `.env` en `backend/api/`
3. Ejecuta las migraciones: `npm run migrate`

### 3. No puedo acceder a Configuración (Admin)

**Causa:** No has iniciado sesión como administrador.

**Solución:**
1. Cierra sesión si estás logueado
2. Inicia sesión con: `admin@tienda.com` / `admin123`
3. Verifica que veas 5 pestañas (Dashboard, Productos, Órdenes, Configuración, Perfil)

### 4. El logo no se muestra

**Causa:** Imagen inválida o muy grande.

**Solución:**
1. Usa imágenes PNG o JPG
2. Tamaño recomendado: 512x512 px
3. Peso máximo: 5MB

---

## ✅ Verificación de Instalación

Ejecuta estos comandos para verificar que todo esté configurado:

```bash
# Verificar Node.js
node --version  # Debe ser v18 o superior

# Verificar npm
npm --version

# Verificar PostgreSQL
psql --version

# Verificar backend
cd backend/api
npm run dev
# Abre http://localhost:4000/v1/products en el navegador

# Verificar frontend
cd ../../frontend
npm run verify
# Debe mostrar: ✅ Configuración verificada correctamente
```

---

## 🎯 Flujo de Trabajo Recomendado

### Primera Vez
```bash
# 1. Instalar todo
npm install
cd backend/api && npm install
cd ../../frontend && npm install

# 2. Configurar base de datos
cd ..
npm run migrate
npm run seed

# 3. Configurar IP
cd frontend
npm run detect-ip

# 4. Iniciar todo
cd ..
npm start
```

### Días Siguientes
```bash
# Solo ejecuta
npm start
```

---

## 🆕 Novedades - Panel de Administrador

### ⭐ Nueva Funcionalidad: Configuración de la Tienda

Los administradores ahora pueden personalizar completamente la tienda:

#### 🖼️ Logo Personalizado
- Sube tu propio logo desde la galería
- Vista previa en tiempo real
- Se muestra en el catálogo junto al nombre

#### ✏️ Nombre de la Tienda
- Cambia "Tienda" por el nombre que desees
- Actualización instantánea en toda la app

#### 🔤 Tipo de Letra
- Elige entre 4 fuentes diferentes
- Vista previa antes de aplicar
- Cambio global en la aplicación

#### 🔒 Seguridad
- Cambio de contraseña dedicado para el admin
- Validaciones completas

**Cómo acceder:**
1. Inicia sesión como admin
2. Ve a la pestaña "Configuración" (⚙️)
3. Personaliza tu tienda



---

## 📞 Soporte y Ayuda

Si encuentras problemas:

1. **Verifica los logs:**
   - Terminal del backend: Errores de base de datos o servidor
   - Terminal de Expo: Errores de compilación o runtime
   - Consola de Expo Go: Errores en el dispositivo

2. **Ejecuta diagnósticos:**
   ```bash
   cd frontend
   npm run verify
   npm run detect-ip
   ```

---

## 📄 Licencia

Este proyecto es privado y no tiene licencia pública.

---

## 📊 Estadísticas del Proyecto

- **Versión:** 1.1.0
- **Estado:** ✅ Producción Ready
- **Última actualización:** Noviembre 2025
- **Líneas de código:** ~15,000
- **Pantallas:** 12+
- **Componentes:** 30+
- **Endpoints API:** 20+

---

## 🙏 Créditos

- **Diseño:** Inspirado en Falabella
- **Framework:** Expo & React Native
- **Backend:** Express.js & PostgreSQL
- **Iconos:** SF Symbols (iOS)

---

**¿Listo para empezar?** Ejecuta `npm start` y comienza a vender 🚀
