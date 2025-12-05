# 🔄 Cómo Funciona la Sincronización de Cambios del Admin

## 📊 Flujo General

```
Admin Panel (admin-settings.tsx)
         ↓
    Cambios de Configuración
         ↓
    updateAllSettings() ← FUNCIÓN PRINCIPAL
         ↓
    Backend API (PUT /settings)
         ↓
    Base de Datos
         ↓
    AppConfigContext (actualiza estado)
         ↓
    Toda la App se Actualiza
```

## 🎯 Función Principal: `updateAllSettings()`

Esta es la función que jala y sincroniza todos los cambios del admin.

### Ubicación
```
frontend/context/AppConfigContext.tsx
```

### Código
```typescript
async function updateAllSettings(settings: Partial<AppConfig>) {
  try {
    // 1. Obtener el token de autenticación
    const token = await AsyncStorage.getItem('token')
    
    // 2. Convertir datos al formato del backend
    const backendSettings: any = {}
    if (settings.storeName !== undefined) backendSettings.store_name = settings.storeName
    if (settings.storeLogo !== undefined) backendSettings.store_logo = settings.storeLogo
    if (settings.fontFamily !== undefined) backendSettings.font_family = settings.fontFamily
    if (settings.displayMode !== undefined) backendSettings.display_mode = settings.displayMode

    // 3. Enviar al backend
    const response = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(backendSettings)
    })

    // 4. Actualizar el estado local
    const newConfig = { ...config, ...settings }
    setConfig(newConfig)
    
    // 5. Guardar en cache local
    await AsyncStorage.setItem('app.config', JSON.stringify(newConfig))
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}
```

## 🔑 Funciones Disponibles

### 1. `updateAllSettings()` - Actualizar Todo
```typescript
const { updateAllSettings } = useAppConfig()

await updateAllSettings({
  storeName: 'Mi Tienda',
  storeLogo: 'https://...',
  fontFamily: 'sans-serif',
  displayMode: 'both'
})
```

### 2. `updateStoreName()` - Solo Nombre
```typescript
const { updateStoreName } = useAppConfig()
await updateStoreName('Nueva Tienda')
```

### 3. `updateStoreLogo()` - Solo Logo
```typescript
const { updateStoreLogo } = useAppConfig()
await updateStoreLogo('https://...')
```

### 4. `updateFontFamily()` - Solo Fuente
```typescript
const { updateFontFamily } = useAppConfig()
await updateFontFamily('serif')
```

### 5. `refreshConfig()` - Recargar desde Backend
```typescript
const { refreshConfig } = useAppConfig()
await refreshConfig()
```

## 📍 Dónde se Usa

### En admin-settings.tsx
```typescript
const { config, updateAllSettings } = useAppConfig()

async function handleSaveChanges() {
  await updateAllSettings({
    storeName: tempStoreName.trim(),
    storeLogo: tempLogoUri,
    fontFamily: tempSelectedFont,
    displayMode: tempDisplayMode
  })
}
```

### En _layout.tsx
```typescript
const { config } = useAppConfig()

// Usa config.storeName y config.storeLogo
document.title = config.storeName
favicon.href = config.storeLogo
```

### En catalog.tsx
```typescript
const { config } = useAppConfig()

// Usa el logo y nombre en el header
<Image source={{ uri: config.storeLogo }} />
<Text>{config.storeName}</Text>
```

## 🔄 Flujo Paso a Paso

### Cuando Guardas Cambios en Admin

1. **Usuario presiona "Guardar cambios"** en admin-settings.tsx
2. **Se llama `updateAllSettings()`** con los nuevos valores
3. **Se obtiene el token** de autenticación del usuario
4. **Se envía PUT request** al backend: `PUT /settings`
5. **Backend valida** que sea admin y guarda en BD
6. **Se actualiza el estado** en AppConfigContext
7. **Se guarda en cache** local (AsyncStorage)
8. **Todos los componentes** que usan `useAppConfig()` se actualizan
9. **El navegador** se actualiza (título y favicon)
10. **El catálogo** muestra el nuevo logo y nombre

## 📦 Estructura de Datos

### En Frontend
```typescript
type AppConfig = {
  storeName: string           // Nombre de la tienda
  storeLogo: string | null    // URL del logo
  fontFamily: string          // Tipo de letra
  displayMode: 'logo' | 'text' | 'both'  // Qué mostrar
}
```

### En Backend (API)
```json
{
  "store_name": "Mi Tienda",
  "store_logo": "https://...",
  "font_family": "sans-serif",
  "display_mode": "both"
}
```

## 🔐 Validaciones

### En Frontend
- Verifica que haya token (usuario autenticado)
- Valida que el nombre no esté vacío
- Valida que el logo sea una URL válida

### En Backend
- Verifica que sea usuario ADMIN
- Valida el token JWT
- Guarda en la base de datos

## 💾 Persistencia

Los cambios se guardan en 3 lugares:

1. **Backend (Base de Datos)** - Permanente
2. **AsyncStorage (Cache Local)** - Persistente entre sesiones
3. **Estado React (Memory)** - Actual en la app

## 🚀 Cómo Agregar Nuevas Configuraciones

### 1. Agregar al tipo AppConfig
```typescript
type AppConfig = {
  // ... existentes
  nuevoColor: string  // Nueva propiedad
}
```

### 2. Agregar al defaultConfig
```typescript
const defaultConfig: AppConfig = {
  // ... existentes
  nuevoColor: '#000000'
}
```

### 3. Agregar al updateAllSettings
```typescript
if (settings.nuevoColor !== undefined) 
  backendSettings.nuevo_color = settings.nuevoColor
```

### 4. Usar en componentes
```typescript
const { config } = useAppConfig()
console.log(config.nuevoColor)
```

## 🐛 Solución de Problemas

### Los cambios no se guardan
- Verifica que tengas sesión activa (token válido)
- Comprueba que seas admin
- Revisa la consola para errores

### Los cambios no se reflejan en toda la app
- Recarga la página
- Verifica que el componente use `useAppConfig()`
- Comprueba que esté dentro de `AppConfigProvider`

### El backend no recibe los cambios
- Verifica que la API URL sea correcta
- Comprueba que el endpoint `/settings` exista
- Revisa los logs del backend

## 📝 Archivos Relacionados

- `frontend/context/AppConfigContext.tsx` - Contexto principal
- `frontend/app/(tabs)/admin-settings.tsx` - Panel de admin
- `frontend/app/_layout.tsx` - Usa la configuración
- `frontend/app/(tabs)/catalog.tsx` - Muestra el logo y nombre
- `frontend/app/(tabs)/perfil.tsx` - Acceso a admin-settings
