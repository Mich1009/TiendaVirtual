# 🚀 Cómo Iniciar Backend y Frontend

## ⚠️ REQUISITOS PREVIOS

Antes de iniciar, verifica que tengas:

1. **PostgreSQL corriendo**
   ```bash
   # Verificar que PostgreSQL está activo
   # Windows: Busca "Services" y verifica que PostgreSQL está corriendo
   # Mac/Linux: psql --version
   ```

2. **Node.js instalado**
   ```bash
   node --version  # Debe ser v18 o superior
   ```

3. **npm instalado**
   ```bash
   npm --version
   ```

---

## 📁 ESTRUCTURA DEL PROYECTO

```
TiendaVirtual/
├── backend/api/          ← Backend (Node.js)
├── frontend/             ← Frontend (React Native)
└── package.json          ← Scripts principales
```

---

## 🔧 PASO 1: Instalar Dependencias (Primera Vez)

### Backend

```bash
cd backend/api
npm install
```

### Frontend

```bash
cd frontend
npm install
```

---

## ▶️ PASO 2: Iniciar Backend

### Opción A: Terminal 1 (Recomendado)

```bash
# Navega a la carpeta del backend
cd backend/api

# Inicia el servidor
npm run dev
```

**Verás en la terminal:**
```
🚀 API en http://0.0.0.0:4000

✓ Base de datos lista

✓ Job de pedidos iniciado
```

**¿Qué significa?**
- El backend está corriendo en puerto 4000
- La base de datos está conectada
- Los jobs automáticos están activos

---

## ▶️ PASO 3: Iniciar Frontend

### Opción A: Terminal 2 (Nueva Terminal)

```bash
# Navega a la carpeta del frontend
cd frontend

# Inicia Expo
npm start
```

**Verás en la terminal:**
```
› Metro waiting on exp://...
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

**¿Qué significa?**
- Expo está corriendo
- Puedes escanear el QR con tu celular
- La app se abrirá en Expo Go

---

## 📱 PASO 4: Abrir la App en tu Celular

### Opción 1: Escanear QR (Más Fácil)

1. Abre **Expo Go** en tu celular (descárgalo si no lo tienes)
2. Presiona el botón de cámara
3. Escanea el QR que aparece en la terminal
4. ¡La app se abre automáticamente!

### Opción 2: Escribir URL Manualmente

1. En la terminal del frontend, verás algo como:
   ```
   exp://192.168.1.100:19000
   ```
2. Abre Expo Go
3. Presiona "Scan QR code"
4. Escribe la URL manualmente

### Opción 3: Emulador Android

```bash
# En la terminal del frontend, presiona:
a
```

---

## ✅ VERIFICAR QUE TODO FUNCIONA

### Backend

```bash
# Abre tu navegador y ve a:
http://localhost:4000/v1/products

# Deberías ver una lista de productos en JSON
```

### Frontend

```bash
# En la app, deberías ver:
- Catálogo de productos
- Carrito vacío
- Botón de login
```

---

## 🛑 DETENER BACKEND Y FRONTEND

### Detener Backend

```bash
# En la terminal del backend, presiona:
Ctrl + C
```

### Detener Frontend

```bash
# En la terminal del frontend, presiona:
Ctrl + C
```

---

## 🔄 FLUJO COMPLETO

```
Terminal 1: Backend
$ cd backend/api
$ npm run dev
✓ Backend corriendo en puerto 4000

Terminal 2: Frontend
$ cd frontend
$ npm start
✓ Expo corriendo, escanea QR

Celular: Expo Go
Escanea QR
✓ App abierta en tu celular
```

---

## ⚡ COMANDOS RÁPIDOS

```bash
# Backend
cd backend/api && npm run dev

# Frontend
cd frontend && npm start

# Ambos (en terminales separadas)
# Terminal 1: cd backend/api && npm run dev
# Terminal 2: cd frontend && npm start
```

---

## 🐛 PROBLEMAS COMUNES

### "Port 4000 already in use"

```bash
# El puerto 4000 ya está en uso
# Solución: Mata el proceso

# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :4000
kill -9 <PID>
```

### "Cannot find module"

```bash
# Falta instalar dependencias
cd backend/api
npm install

cd ../../frontend
npm install
```

### "PostgreSQL connection failed"

```bash
# PostgreSQL no está corriendo
# Solución: Inicia PostgreSQL

# Windows: Busca "Services" y inicia PostgreSQL
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### "Expo connection failed"

```bash
# Verifica que tu celular está en la misma red WiFi
# Verifica la IP en el archivo frontend/.env
```

---

## 📊 RESUMEN

| Paso | Comando | Terminal |
|------|---------|----------|
| 1 | `cd backend/api && npm install` | 1 |
| 2 | `cd frontend && npm install` | 1 |
| 3 | `cd backend/api && npm run dev` | 1 |
| 4 | `cd frontend && npm start` | 2 |
| 5 | Escanea QR en Expo Go | Celular |

