# ⚡ Inicio Rápido - TiendaVirtual Web

## 🎯 3 Pasos para Ejecutar en Web

### Paso 1: Obtén la IP del Servidor (PC Anfitrión)

**Windows:**
```powershell
ipconfig | findstr "IPv4"
```

Busca algo como `192.168.x.x` o `10.x.x.x`

### Paso 2: Actualiza la URL en `app.json`

Abre: `frontend/app.json`

Encuentra:
```json
"extra": {
  "API_URL": "http://10.238.141.40:4000/v1",
```

Reemplaza `10.238.141.40` con tu IP:
```json
"extra": {
  "API_URL": "http://TU_IP_AQUI:4000/v1",
```

### Paso 3: Ejecuta

**Terminal 1 - Backend (PC Anfitrión):**
```bash
cd backend/api
npm start
```

Espera a ver: `✓ Base de datos lista`

**Terminal 2 - Frontend (Tu PC):**
```bash
cd frontend
npm start
```

Espera a que termine de compilar, luego presiona **`w`** para abrir web.

---

## ✅ Prueba Rápida de Conectividad

```powershell
# Reemplaza TU_IP con tu IP real
Invoke-WebRequest -Uri "http://TU_IP:4000/v1/categories"
```

Si funciona, verás datos JSON. ✅

---

## 👥 Cuentas de Prueba

| Tipo | Email | Contraseña |
|------|-------|-----------|
| Usuario | user@example.com | user123 |
| Admin | admin@example.com | admin123 |

---

## 🚨 Problemas Comunes

| Problema | Solución |
|----------|----------|
| "Network request failed" | Verifica IP en `app.json` y que backend está corriendo |
| Puerto ocupado | Mata procesos: `Get-Process node \| Stop-Process -Force` |
| Cambios no aparecen | Presiona `r` en la terminal del frontend |

---

Para más detalles, ve a: **README_WEB.md**
