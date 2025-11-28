# 🏪 Configuración de Logo y Título de la Tienda

## 📍 Ubicación de Archivos

### Backend
```
backend/api/src/
├── routes/
│   └── settings.js          ← Rutas de configuración
├── migrations/
│   └── 0001_init.js         ← Tabla store_settings
└── db/
    └── knex.js              ← Conexión a BD
```

### Frontend
```
frontend/
├── context/
│   └── AppConfigContext.tsx ← Estado global de configuración
└── app/
    └── (tabs)/
        └── admin-settings.tsx ← Pantalla de configuración
```

---

## 🗄️ Base de Datos

### Tabla: `store_settings`

```sql
CREATE TABLE store_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Configuraciones Disponibles

| Key | Valor | Descripción |
|-----|-------|-------------|
| `store_name` | String | Nombre de la tienda |
| `store_logo` | URL | URL del logo (imagen) |
| `font_family` | String | Tipo de letra (System, sans-serif, serif, monospace) |
| `display_mode` | String | Cómo mostrar: "logo", "text", "both" |

### Datos Iniciales

```sql
INSERT INTO store_settings (key, value) VALUES
('store_name', 'Tienda'),
('store_logo', NULL),
('font_family', 'System'),
('display_mode', 'both');
```

---

## 🔄 Flujo de Funcionamiento

### 1️⃣ CARGAR CONFIGURACIÓN (Al iniciar la app)

```
App inicia
    ↓
Frontend: AppConfigContext.tsx → loadConfig()
    ↓
Intenta cargar desde backend: GET /v1/settings
    ↓
Si éxito:
    - Obtiene: { store_name, store_logo, font_family, display_mode }
    - Guarda en AsyncStorage (cache local)
    - Actualiza el estado del Context
    ↓
Si falla:
    - Carga desde AsyncStorage (cache local)
    - Si no hay cache → usa valores por defecto
    ↓
Componentes acceden a config con: useAppConfig()
```

### 2️⃣ MOSTRAR CONFIGURACIÓN EN CATÁLOGO

```
Pantalla: frontend/app/(tabs)/catalog.tsx
    ↓
Obtiene config: const { config } = useAppConfig()
    ↓
Según display_mode:
    - "logo" → Muestra solo el logo
    - "text" → Muestra solo el nombre
    - "both" → Muestra logo + nombre
    ↓
Aplica font_family al nombre
    ↓
Renderiza en el header
```

### 3️⃣ CAMBIAR CONFIGURACIÓN (Solo Admin)

```
Admin en app
    ↓
Presiona: Perfil → ⚙️ Configuración
    ↓
Verifica que es ADMIN (getUser().role === 'ADMIN')
    ↓
Muestra pantalla: admin-settings.tsx
    ↓
Admin modifica:
    - Nombre de la tienda
    - Logo (sube imagen)
    - Tipo de letra
    - Modo de visualización
    ↓
Presiona: "Guardar cambios"
    ↓
Frontend: updateAllSettings()
    ↓
Envía PUT /v1/settings con token de admin
    ↓
Backend verifica: authRequired + adminOnly
    ↓
Actualiza en BD: store_settings
    ↓
Retorna: { store_name, store_logo, font_family, display_mode }
    ↓
Frontend actualiza Context
    ↓
Todos los componentes se re-renderizan con nueva config
```

---

## 🛠️ Backend: Rutas de Configuración

### Archivo: `backend/api/src/routes/settings.js`

#### 1. GET /v1/settings (Público)

**¿Qué hace?**
Esta ruta obtiene TODA la configuración de la tienda. Cualquiera puede acceder (no requiere token).

**Paso a paso:**
1. Consulta la tabla `store_settings` en la BD
2. Obtiene todos los registros (key, value)
3. Convierte el array en un objeto
4. Retorna la configuración

**Ejemplo:**
```javascript
router.get('/', async (req, res, next) => {
  try {
    // 1. Obtiene todos los registros de store_settings
    const settings = await knex('store_settings').select('key', 'value');
    // Resultado: [
    //   { key: 'store_name', value: 'Mi Tienda' },
    //   { key: 'store_logo', value: 'https://...' },
    //   { key: 'font_family', value: 'sans-serif' },
    //   { key: 'display_mode', value: 'both' }
    // ]
    
    // 2. Convierte array a objeto
    const config = settings.reduce((acc, { key, value }) => {
      acc[key] = value;  // acc['store_name'] = 'Mi Tienda'
      return acc;
    }, {});
    
    // 3. Retorna el objeto
    res.json(config);
  } catch (error) {
    next(error);
  }
});
```

**Respuesta que recibe el cliente:**
```json
{
  "store_name": "Mi Tienda",
  "store_logo": "https://example.com/logo.png",
  "font_family": "sans-serif",
  "display_mode": "both"
}
```

**Cómo se usa desde el frontend:**
```javascript
// El frontend hace esta petición
const response = await fetch('http://localhost:4000/v1/settings');
const config = await response.json();

console.log(config.store_name);    // "Mi Tienda"
console.log(config.store_logo);    // "https://example.com/logo.png"
```

#### 2. PUT /v1/settings/:key (Solo Admin)

**¿Qué hace?**
Esta ruta actualiza UNA configuración específica. Solo el ADMIN puede usarla.

**Paso a paso:**
1. Verifica que el usuario está autenticado (tiene token)
2. Verifica que el usuario es ADMIN
3. Valida que la key es válida (store_name, store_logo, etc)
4. Busca si ya existe esa configuración en la BD
5. Si existe → actualiza el valor
6. Si no existe → crea un nuevo registro
7. Retorna la configuración actualizada

**Ejemplo:**
```javascript
router.put('/:key', authRequired, adminOnly, async (req, res, next) => {
  try {
    // 1. Obtiene la key de la URL y el value del body
    const { key } = req.params;           // "store_name"
    const { value } = req.body;           // "Nueva Tienda"
    
    // 2. Valida que la key sea permitida
    const validKeys = ['store_name', 'store_logo', 'font_family', 'display_mode'];
    if (!validKeys.includes(key)) {
      return res.status(400).json({ error: 'Configuración inválida' });
    }
    
    // 3. Busca si ya existe
    const exists = await knex('store_settings').where({ key }).first();
    // Si existe: { id: 1, key: 'store_name', value: 'Tienda Vieja', ... }
    // Si no existe: undefined
    
    // 4. Actualiza o inserta
    if (exists) {
      // Ya existe, actualizar
      await knex('store_settings')
        .where({ key })
        .update({ 
          value,                      // "Nueva Tienda"
          updated_at: knex.fn.now()   // Fecha actual
        });
    } else {
      // No existe, crear
      await knex('store_settings').insert({ key, value });
    }
    
    // 5. Retorna lo que se guardó
    res.json({ key, value });
    // Retorna: { key: 'store_name', value: 'Nueva Tienda' }
  } catch (error) {
    next(error);
  }
});
```

**Cómo se usa desde el frontend:**
```javascript
// El admin quiere cambiar el nombre de la tienda
const token = 'eyJhbGc...'; // Token del admin

const response = await fetch('http://localhost:4000/v1/settings/store_name', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ value: 'Nueva Tienda' })
});

const result = await response.json();
console.log(result);  // { key: 'store_name', value: 'Nueva Tienda' }
```

**Errores posibles:**
- `401 Unauthorized` - No tiene token o token inválido
- `403 Forbidden` - No es ADMIN
- `400 Bad Request` - La key no es válida

#### 3. PUT /v1/settings (Solo Admin - Múltiples)

**¿Qué hace?**
Esta ruta actualiza VARIAS configuraciones a la vez. Es más eficiente que hacer múltiples peticiones.

**Paso a paso:**
1. Verifica que el usuario está autenticado y es ADMIN
2. Recibe un objeto con múltiples configuraciones
3. Para cada configuración:
   - Valida que la key es válida
   - Busca si existe en la BD
   - Actualiza o inserta
4. Retorna todas las configuraciones actualizadas

**Ejemplo:**
```javascript
router.put('/', authRequired, adminOnly, async (req, res, next) => {
  try {
    // 1. Recibe múltiples configuraciones
    const updates = req.body;
    // {
    //   store_name: 'Nueva Tienda',
    //   font_family: 'sans-serif',
    //   display_mode: 'both'
    // }
    
    const validKeys = ['store_name', 'store_logo', 'font_family', 'display_mode'];
    const results = {};
    
    // 2. Procesa cada configuración
    for (const [key, value] of Object.entries(updates)) {
      // key = 'store_name', value = 'Nueva Tienda'
      
      // Valida que la key sea permitida
      if (validKeys.includes(key)) {
        // Busca si existe
        const exists = await knex('store_settings').where({ key }).first();
        
        if (exists) {
          // Actualiza
          await knex('store_settings')
            .where({ key })
            .update({ value, updated_at: knex.fn.now() });
        } else {
          // Inserta
          await knex('store_settings').insert({ key, value });
        }
        
        // Guarda el resultado
        results[key] = value;
      }
    }
    
    // 3. Retorna todas las configuraciones actualizadas
    res.json(results);
    // {
    //   store_name: 'Nueva Tienda',
    //   font_family: 'sans-serif',
    //   display_mode: 'both'
    // }
  } catch (error) {
    next(error);
  }
});
```

**Cómo se usa desde el frontend:**
```javascript
// El admin quiere cambiar varias cosas a la vez
const token = 'eyJhbGc...'; // Token del admin

const response = await fetch('http://localhost:4000/v1/settings', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    store_name: 'Nueva Tienda',
    font_family: 'sans-serif',
    display_mode: 'both'
  })
});

const result = await response.json();
console.log(result);
// {
//   store_name: 'Nueva Tienda',
//   font_family: 'sans-serif',
//   display_mode: 'both'
// }
```

**Ventaja:**
En lugar de hacer 3 peticiones PUT separadas, hace todo en 1 sola petición. Más rápido y eficiente.

---

## 🎨 Frontend: Context de Configuración

### Archivo: `frontend/context/AppConfigContext.tsx`

#### Estructura del Context

```typescript
type AppConfig = {
  storeName: string;
  storeLogo: string | null;
  fontFamily: string;
  displayMode: 'logo' | 'text' | 'both';
};

type AppConfigContextType = {
  config: AppConfig;
  updateStoreName: (name: string) => Promise<void>;
  updateStoreLogo: (logo: string | null) => Promise<void>;
  updateFontFamily: (font: string) => Promise<void>;
  updateAllSettings: (settings: Partial<AppConfig>) => Promise<void>;
  resetConfig: () => Promise<void>;
  refreshConfig: () => Promise<void>;
};
```

#### Funciones Principales

##### 1. loadConfig() - Cargar configuración

**¿Qué hace?**
Carga la configuración de la tienda cuando la app inicia. Intenta cargar desde el backend, y si falla, usa el cache local.

**Paso a paso:**
1. Intenta conectar con el backend
2. Si éxito → obtiene la configuración y la guarda en cache
3. Si falla → carga desde el cache local
4. Si no hay cache → usa valores por defecto

**Ejemplo:**
```typescript
async function loadConfig() {
  try {
    // 1. Intenta cargar desde el backend
    const response = await fetch(`${API_URL}/settings`);
    // Hace: GET http://localhost:4000/v1/settings
    
    if (response.ok) {
      // 2. Recibió la respuesta correctamente
      const data = await response.json();
      // data = {
      //   store_name: 'Mi Tienda',
      //   store_logo: 'https://...',
      //   font_family: 'sans-serif',
      //   display_mode: 'both'
      // }
      
      // 3. Convierte a formato del Context
      const newConfig: AppConfig = {
        storeName: data.store_name || 'Tienda',
        storeLogo: data.store_logo || null,
        fontFamily: data.font_family || 'System',
        displayMode: data.display_mode || 'both'
      };
      
      // 4. Actualiza el estado
      setConfig(newConfig);
      
      // 5. Guarda en cache local (AsyncStorage)
      await AsyncStorage.setItem('app.config', JSON.stringify(newConfig));
      return;
    }
  } catch (error) {
    // El backend no respondió o hay error de conexión
    console.log('No se pudo cargar desde backend, usando cache local');
  }

  // 6. Fallback: cargar desde AsyncStorage (cache local)
  try {
    const saved = await AsyncStorage.getItem('app.config');
    // saved = '{"storeName":"Mi Tienda","storeLogo":"...","fontFamily":"System","displayMode":"both"}'
    
    if (saved) {
      // Convierte el JSON string a objeto
      setConfig(JSON.parse(saved));
    }
  } catch (error) {
    console.error('Error cargando configuración:', error);
  }
}
```

**¿Por qué dos intentos?**
- **Primer intento (Backend)**: Obtiene la configuración más reciente
- **Segundo intento (Cache)**: Si el backend no está disponible, usa lo que se guardó antes
- **Ventaja**: La app funciona incluso sin conexión a internet

##### 2. updateAllSettings() - Actualizar múltiples configuraciones

**¿Qué hace?**
Actualiza la configuración en el backend y en el cache local. Solo funciona si el usuario es ADMIN.

**Paso a paso:**
1. Obtiene el token del usuario (para verificar que es ADMIN)
2. Convierte los datos al formato que espera el backend
3. Envía PUT /v1/settings con el token
4. Si éxito → actualiza el estado local y el cache
5. Si falla → muestra error descriptivo

**Ejemplo:**
```typescript
async function updateAllSettings(settings: Partial<AppConfig>) {
  try {
    // 1. Obtiene el token del usuario
    const token = await AsyncStorage.getItem('token');
    // token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    
    if (!token) {
      throw new Error('No hay sesión activa');
    }
    
    // 2. Convierte a formato del backend
    // Frontend usa: { storeName, storeLogo, fontFamily, displayMode }
    // Backend espera: { store_name, store_logo, font_family, display_mode }
    const backendSettings: any = {};
    if (settings.storeName !== undefined) 
      backendSettings.store_name = settings.storeName;
    if (settings.storeLogo !== undefined) 
      backendSettings.store_logo = settings.storeLogo;
    if (settings.fontFamily !== undefined) 
      backendSettings.font_family = settings.fontFamily;
    if (settings.displayMode !== undefined) 
      backendSettings.display_mode = settings.displayMode;

    // 3. Envía la petición al backend
    const response = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  // Incluye el token
      },
      body: JSON.stringify(backendSettings)
    });

    // 4. Verifica si la petición fue exitosa
    if (!response.ok) {
      // Errores específicos
      if (response.status === 401) {
        throw new Error('Sesión expirada');
      } else if (response.status === 403) {
        throw new Error('No tienes permisos (solo ADMIN)');
      }
      throw new Error(`Error ${response.status}`);
    }

    // 5. Actualiza el estado local
    const newConfig = { ...config, ...settings };
    setConfig(newConfig);
    
    // 6. Guarda en cache local
    await AsyncStorage.setItem('app.config', JSON.stringify(newConfig));
    console.log('✅ Configuración actualizada');
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    throw error;
  }
}
```

**Cómo se usa:**
```typescript
// El admin quiere cambiar el nombre y el logo
await updateAllSettings({
  storeName: 'Nueva Tienda',
  storeLogo: 'https://example.com/logo.png'
});

// Automáticamente:
// 1. Envía PUT /v1/settings al backend
// 2. Backend actualiza la BD
// 3. Frontend actualiza el Context
// 4. Todos los componentes ven los cambios
```

#### Uso en Componentes

**¿Cómo acceder a la configuración desde cualquier componente?**

```typescript
import { useAppConfig } from '@/context/AppConfigContext';

export default function MiComponente() {
  // 1. Obtiene el Context
  const { config, updateAllSettings } = useAppConfig();
  
  // 2. Accede a la configuración
  console.log(config.storeName);    // "Mi Tienda"
  console.log(config.storeLogo);    // "https://..."
  console.log(config.fontFamily);   // "sans-serif"
  console.log(config.displayMode);  // "both"
  
  // 3. Actualiza la configuración
  async function cambiarNombre() {
    await updateAllSettings({
      storeName: 'Nueva Tienda'
    });
    // Automáticamente se actualiza en todos los componentes
  }
  
  // 4. Usa la configuración en el render
  return (
    <View>
      {/* Muestra el nombre con la fuente configurada */}
      <Text style={{ fontFamily: config.fontFamily }}>
        {config.storeName}
      </Text>
      
      {/* Muestra el logo si está configurado */}
      {config.storeLogo && (
        <Image source={{ uri: config.storeLogo }} style={{ width: 40, height: 40 }} />
      )}
    </View>
  );
}
```

**Ejemplo real: Catálogo de productos**

```typescript
// frontend/app/(tabs)/catalog.tsx
import { useAppConfig } from '@/context/AppConfigContext';

export default function CatalogoScreen() {
  const { config } = useAppConfig();
  
  return (
    <View>
      {/* Header con configuración */}
      <View style={styles.header}>
        {/* Mostrar logo si el modo lo permite */}
        {(config.displayMode === 'logo' || config.displayMode === 'both') && config.storeLogo && (
          <Image source={{ uri: config.storeLogo }} style={styles.logo} />
        )}
        
        {/* Mostrar nombre si el modo lo permite */}
        {(config.displayMode === 'text' || config.displayMode === 'both') && (
          <Text style={[
            styles.title,
            { fontFamily: config.fontFamily }  // Aplica la fuente configurada
          ]}>
            {config.storeName}
          </Text>
        )}
      </View>
      
      {/* Resto del catálogo */}
    </View>
  );
}
```

**¿Qué pasa cuando el admin cambia la configuración?**
1. Admin va a Configuración
2. Cambia el nombre a "Nueva Tienda"
3. Presiona "Guardar"
4. `updateAllSettings()` actualiza el Context
5. El Context notifica a TODOS los componentes que usan `useAppConfig()`
6. El catálogo se re-renderiza automáticamente con el nuevo nombre
7. El cliente ve el cambio sin recargar la app

---

## 📱 Frontend: Pantalla de Configuración

### Archivo: `frontend/app/(tabs)/admin-settings.tsx`

#### Flujo de la Pantalla

```
1. Verifica que el usuario es ADMIN
   ↓
2. Carga la configuración actual del Context
   ↓
3. Muestra vista previa del header
   ↓
4. Permite cambiar:
   - Nombre de la tienda
   - Logo (subir imagen)
   - Tipo de letra
   - Modo de visualización
   ↓
5. Detecta cambios (hasChanges = true)
   ↓
6. Muestra botones: "Cancelar" y "Guardar cambios"
   ↓
7. Al guardar:
   - Valida datos
   - Envía PUT /v1/settings
   - Actualiza Context
   - Muestra mensaje de éxito
```

#### Componentes Principales

##### Vista Previa del Header

```typescript
<View style={styles.headerPreview}>
  {/* Mostrar logo si el modo lo permite */}
  {(tempDisplayMode === 'logo' || tempDisplayMode === 'both') && (
    tempLogoUri ? (
      <Image source={{ uri: tempLogoUri }} style={styles.logoPreview} />
    ) : (
      <View style={styles.logoPlaceholder}>
        <Text>🏪</Text>
      </View>
    )
  )}
  
  {/* Mostrar nombre si el modo lo permite */}
  {(tempDisplayMode === 'text' || tempDisplayMode === 'both') && (
    <Text style={[
      styles.storeNamePreview,
      { fontFamily: tempSelectedFont !== 'System' ? tempSelectedFont : undefined }
    ]}>
      {tempStoreName || 'Tienda'}
    </Text>
  )}
</View>
```

##### Selector de Modo de Visualización

```typescript
<Pressable
  onPress={() => setTempDisplayMode('both')}
  style={[
    styles.displayModeOption,
    tempDisplayMode === 'both' && styles.displayModeOptionSelected
  ]}
>
  <View style={styles.displayModeContent}>
    <Text style={styles.displayModeEmoji}>🖼️📝</Text>
    <Text style={styles.displayModeLabel}>Logo y texto</Text>
    <Text style={styles.displayModeDescription}>
      Mostrar logo y nombre juntos
    </Text>
  </View>
  {tempDisplayMode === 'both' && (
    <IconSymbol name="checkmark.circle.fill" size={20} color={FalabellaColors.primary} />
  )}
</Pressable>
```

##### Subida de Logo

```typescript
async function handlePickImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
  });

  if (!result.canceled && result.assets[0]) {
    const asset = result.assets[0];
    
    // Validar tamaño
    if (asset.fileSize && asset.fileSize > 1024 * 1024) {
      Alert.alert('Imagen grande', 'Se recomienda usar imágenes más pequeñas');
    }
    
    setTempLogoUri(asset.uri);
  }
}
```

---

## 🎯 Casos de Uso

### Caso 1: Cliente ve la tienda con configuración

```
1. App inicia
2. AppConfigContext carga configuración
3. Pantalla de catálogo obtiene config con useAppConfig()
4. Renderiza header según display_mode:
   - Si "logo" → muestra solo logo
   - Si "text" → muestra solo nombre
   - Si "both" → muestra logo + nombre
5. Aplica font_family al nombre
```

### Caso 2: Admin cambia el nombre de la tienda

```
1. Admin va a Perfil → ⚙️ Configuración
2. Ingresa nuevo nombre: "Mi Tienda Online"
3. Ve la vista previa actualizada
4. Presiona "Guardar cambios"
5. Frontend envía PUT /v1/settings
6. Backend actualiza en BD
7. Context se actualiza
8. Todos los componentes ven el nuevo nombre
```

### Caso 3: Admin sube un logo

```
1. Admin presiona "Subir logo"
2. Selecciona imagen de la galería
3. Se comprime y se muestra en vista previa
4. Admin presiona "Guardar cambios"
5. Frontend envía PUT /v1/settings con URL del logo
6. Backend actualiza en BD
7. Todos los clientes ven el nuevo logo
```

### Caso 4: Admin cambia el modo de visualización

```
1. Admin selecciona "Solo logo"
2. Vista previa muestra solo el logo
3. Presiona "Guardar cambios"
4. Backend actualiza display_mode = "logo"
5. Todos los clientes ven solo el logo en el header
```

---

## 🔐 Seguridad

- ✅ Solo ADMIN puede cambiar configuración (`authRequired` + `adminOnly`)
- ✅ Validación de keys permitidas
- ✅ Token JWT requerido
- ✅ Errores descriptivos (401, 403, 400)

---

## 📊 Flujo Completo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React Native)                  │
│                                                             │
│  1. App inicia                                              │
│  2. AppConfigContext.loadConfig()                           │
│  3. GET /v1/settings                                        │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                     │
│                                                             │
│  1. GET /v1/settings                                        │
│  2. SELECT * FROM store_settings                            │
│  3. Retorna: { store_name, store_logo, ... }              │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React Native)                  │
│                                                             │
│  1. Recibe configuración                                    │
│  2. Guarda en AsyncStorage (cache)                          │
│  3. Actualiza Context                                       │
│  4. Componentes se re-renderizan                            │
│  5. Catálogo muestra logo/nombre según config              │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN CAMBIA CONFIG                      │
│                                                             │
│  1. Admin va a Configuración                                │
│  2. Modifica nombre, logo, fuente, modo                     │
│  3. Presiona "Guardar cambios"                              │
│  4. PUT /v1/settings con token                              │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                     │
│                                                             │
│  1. Verifica token (authRequired)                           │
│  2. Verifica rol ADMIN (adminOnly)                          │
│  3. UPDATE store_settings                                   │
│  4. Retorna nueva configuración                             │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React Native)                  │
│                                                             │
│  1. Recibe nueva configuración                              │
│  2. Actualiza Context                                       │
│  3. Guarda en AsyncStorage                                  │
│  4. Todos los componentes se re-renderizan                  │
│  5. Clientes ven cambios inmediatamente                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Resumen

| Aspecto | Detalles |
|---------|----------|
| **Tabla BD** | `store_settings` (key, value) |
| **Rutas Backend** | GET/PUT `/v1/settings` |
| **Context Frontend** | `AppConfigContext` |
| **Pantalla Admin** | `admin-settings.tsx` |
| **Protección** | `authRequired` + `adminOnly` |
| **Cache Local** | AsyncStorage |
| **Configuraciones** | store_name, store_logo, font_family, display_mode |

