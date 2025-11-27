# 🛒 TiendaVirtual - Guía de Ejecución en Web

Esta guía te ayudará a ejecutar la aplicación TiendaVirtual en navegador web desde cualquier PC en la red local.

## 📋 Requisitos Previos

- **Node.js** v18+ instalado ([Descargar aquí](https://nodejs.org/))
- **NPM** (incluido con Node.js)
- **Conexión a la red local** entre PC anfitrión (donde corre el backend) y PC cliente (donde se abre la web)

## 🚀 Instalación y Configuración

### 1. Obtener la IP del PC Anfitrión (Servidor Backend)

En la PC donde correrá el backend:

**Windows (PowerShell):**
```powershell
ipconfig | findstr "IPv4"
```

**Linux/Mac (Terminal):**
```bash
ifconfig | grep "inet "
```

Busca una IP como `192.168.x.x` o `10.x.x.x` (NO localhost o 127.0.0.1)

**Ejemplo:** `10.238.141.40`

### 2. Clonar el Proyecto (En ambas PCs)

```bash
git clone <tu-repositorio>
cd TiendaVirtual
```

### 3. Instalar Dependencias del Backend (PC Anfitrión)

```bash
cd backend/api
npm install
```

### 4. Instalar Dependencias del Frontend (PC Anfitrión o Cliente)

```bash
cd frontend
npm install
```

## 🔧 Configuración de la URL de la API

### Paso Crítico: Actualizar `app.json`

En la PC donde ejecutarás el frontend web, edita:
```
frontend/app.json
```

Busca la sección `extra`:
```json
"extra": {
  "API_URL": "http://10.238.141.40:4000/v1",
  "API_URL_MOBILE": "http://10.238.141.40:4000/v1",
  "API_URL_PRODUCTION": "https://backend/api.railway.app/v1"
}
```

**Reemplaza `10.238.141.40` por la IP de tu PC anfitrión:**

```json
"extra": {
  "API_URL": "http://TU_IP_DEL_SERVIDOR:4000/v1",
  "API_URL_MOBILE": "http://TU_IP_DEL_SERVIDOR:4000/v1",
  "API_URL_PRODUCTION": "https://backend/api.railway.app/v1"
}
```

**Ejemplo con IP 192.168.0.50:**
```json
"extra": {
  "API_URL": "http://192.168.0.50:4000/v1",
  "API_URL_MOBILE": "http://192.168.0.50:4000/v1",
  "API_URL_PRODUCTION": "https://backend/api.railway.app/v1"
}
```

## ▶️ Ejecutar la Aplicación

### En PC Anfitrión (Servidor Backend)

1. **Inicia el Backend:**
```bash
cd backend/api
npm start
```

Deberías ver:
```
API escuchando en http://0.0.0.0:4000
✓ Base de datos lista
✓ Migraciones completadas
```

### En PC Cliente (Navegador Web)

1. **Inicia el Frontend:**
```bash
cd frontend
npm start
```

2. **Espera a que Metro Bundler termine de compilar** (puede tardar 1-2 minutos la primera vez)

3. **Cuando veas las instrucciones, presiona `w`** para abrir la web

```
› Web is waiting on http://localhost:8081

› Press w │ open web
```

4. **Se abrirá automáticamente en tu navegador predeterminado**

Si no se abre automáticamente, accede a:
```
http://localhost:8081
```

## ✅ Verificar Conectividad

### Desde PC Cliente, verifica que puedas alcanzar el backend:

**Windows (PowerShell):**
```powershell
Invoke-WebRequest -Uri "http://TU_IP:4000/v1/categories"
```

**Linux/Mac (Terminal):**
```bash
curl http://TU_IP:4000/v1/categories
```

Deberías obtener una respuesta JSON con las categorías.

## 🎯 Uso de la Aplicación Web

Una vez abierta, verás:

### 👤 Usuario Demo
- **Email:** `user@example.com`
- **Contraseña:** `user123`

### 👨‍💼 Administrador Demo
- **Email:** `admin@example.com`
- **Contraseña:** `admin123`

### 📦 Funcionalidades

1. **Catálogo:** Ver 30 productos con imágenes Unsplash
2. **Carrito:** Agregar/quitar productos
3. **Checkout:** Procesar pedidos
4. **Perfil:** Ver información del usuario
5. **Admin Dashboard:** 
   - Gestionar productos
   - Gestionar categorías
   - Gestionar usuarios
   - Ver pedidos
   - Configurar tienda

## 🐛 Troubleshooting

### Error: "Network request failed"

**Causa:** La URL del backend es incorrecta o el backend no está corriendo

**Solución:**
1. Verifica que el backend está corriendo: `npm start` en `backend/api`
2. Verifica la IP en `app.json` es correcta
3. Desde PC cliente, prueba: `ping TU_IP`
4. Verifica firewall no bloquea puerto 4000

### Error: "Port 8081 is being used"

**Solución:**
El sistema automáticamente usará el puerto 8083 en su lugar. O mata procesos Node.js:

```powershell
Get-Process node | Stop-Process -Force
```

### Los iconos no se ven

**Solución:**
1. Limpia caché: `npm start -c`
2. O elimina carpetas y reinstala:
```bash
rm -rf node_modules .expo
npm install
npm start -c
```

### Cambios de código no aparecen

**Solución:**
Presiona `r` en la terminal del frontend para recargar la app

```
› Press r │ reload app
```

## 📱 Plataformas Soportadas

La misma aplicación funciona en:

- ✅ **Web** (navegador) - `press w`
- ✅ **Android** - `press a` (con Expo Go o emulador)
- ✅ **iOS** - `press i` (con Expo Go o simulador)

## 📊 Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    PC ANFITRIÓN (Servidor)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Backend Node.js + Express + PostgreSQL              │  │
│  │  Puerto: 4000                                        │  │
│  │  URL: http://10.238.141.40:4000                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↑
                   (conexión TCP/IP)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    PC CLIENTE (Tu PC)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Frontend React Native Web + Expo                    │  │
│  │  Puerto: 8081 (o 8083)                              │  │
│  │  URL: http://localhost:8081                         │  │
│  │  Conecta a: http://10.238.141.40:4000               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Seguridad en Desarrollo

⚠️ **IMPORTANTE:** Esta configuración es solo para **desarrollo local**

Para producción:
1. Usa HTTPS en lugar de HTTP
2. Configura CORS adecuadamente
3. Usa variables de entorno seguras
4. Implementa rate limiting
5. Valida todas las entradas del usuario

## 📝 Variables de Entorno (Opcional)

Crea un archivo `.env` en la raíz del frontend:

```
EXPO_PUBLIC_API_URL=http://10.238.141.40:4000/v1
```

## 🆘 Soporte

Si tienes problemas:

1. **Verifica logs en terminal:**
   - Backend: `npm start` en `backend/api`
   - Frontend: `npm start` en `frontend`

2. **Abre DevTools en el navegador:**
   - `F12` o `Ctrl+Shift+I`
   - Pestaña "Console" para ver errores

3. **Prueba la API directamente:**
   ```
   http://TU_IP:4000/v1/products
   http://TU_IP:4000/v1/categories
   ```

## 📦 Comandos Útiles

```bash
# Frontend
cd frontend

# Iniciar con limpieza de caché
npm start -c

# Recarga en caliente
# (Presiona 'r' en la terminal mientras está corriendo)

# Backend
cd backend/api

# Iniciar servidor
npm start

# Ver logs de base de datos
npm run logs

# Correr migraciones manualmente
npx knex migrate:latest

# Cargar datos de prueba
npx knex seed:run
```

## 🎉 ¡Listo!

Ya deberías tener la aplicación funcionando completamente en web desde tu PC. 

**Disfruta de tu TiendaVirtual! 🛍️**

---

Última actualización: Noviembre 27, 2025
Versión: 1.0.0
