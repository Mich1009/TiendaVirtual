# 🔐 Sistema de Autenticación

## 📍 Ubicación de Archivos

### Backend (Node.js/Express)
```
backend/api/src/
├── routes/
│   └── auth.js              ← Rutas de login, registro, cambio de contraseña
├── middlewares/
│   └── auth.js              ← Middlewares: authRequired, adminOnly
├── models/
│   └── User.js              ← Modelo de usuario
└── validation/
    └── auth.js              ← Validación de datos (email, contraseña)
```

### Frontend (React Native)
```
frontend/
├── lib/
│   └── auth.ts              ← Funciones para manejar tokens JWT
├── context/
│   └── AuthContext.tsx      ← Estado global de autenticación (si existe)
└── app/
    ├── login.tsx            ← Pantalla de login
    ├── register.tsx         ← Pantalla de registro
    └── (tabs)/
        └── perfil.tsx       ← Perfil del usuario
```

---

## 🔄 Flujo de Autenticación

### 1️⃣ REGISTRO DE CLIENTE (Sign Up)

**Ubicación:** `frontend/app/register.tsx`

```
Usuario → Frontend (register.tsx)
    ↓
    Ingresa: { name, email, password, confirmPassword }
    ↓
    Valida que:
    - Todos los campos estén completos
    - Contraseña tenga mínimo 6 caracteres
    - Las contraseñas coincidan
    ↓
Backend (POST /auth/register)
    ↓
    Valida datos con Joi
    ↓
    Verifica que email no existe
    ↓
    Encripta contraseña con bcryptjs (10 rondas)
    ↓
    Guarda usuario en BD con role: 'CUSTOMER' ← SIEMP

### 2️⃣ LOGIN (Sign In)

```
Usuario → Frontend (login.tsx)
    ↓
    Envía: { email, password }
    ↓
Backend (POST /auth/login)
    ↓
    Valida datos
    ↓
    Busca usuario por email
    ↓
    Compara contraseña con bcryptjs
    ↓
    Genera JWT con: { id, role, email }
    ↓
    Retorna: { accessToken: "eyJhbGc..." }
    ↓
Frontend (lib/auth.ts)
    ↓
    Guarda token en AsyncStorage
    ↓
    Decodifica JWT para obtener rol
    ↓
Redirige según rol:
    - ADMIN → Panel administrativo
    - CUSTOMER → Catálogo de productos
```

### 3️⃣ VERIFICACIÓN DE SESIÓN

```
App inicia → Verifica si hay token en AsyncStorage
    ↓
    Si existe → Decodifica JWT
    ↓
    Obtiene: { id, role, email, exp }
    ↓
    Verifica que no esté expirado
    ↓
    Si es válido → Mantiene sesión
    ↓
    Si expiró → Limpia token y redirige a login
```

---

## 🎯 Cómo Identifica Admin vs Cliente

### En el Backend

**Archivo: `backend/api/src/middlewares/auth.js`**

```javascript
// Middleware 1: Verifica que está autenticado
function authRequired(req, res, next) {
  const token = req.headers['authorization']?.slice(7); // Extrae "Bearer token"
  
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  
  try {
    // Decodifica el JWT y obtiene el payload
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, email }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Middleware 2: Verifica que es ADMIN
function adminOnly(req, res, next) {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Requiere rol ADMIN' });
  }
  next();
}
```

**Uso en rutas:**

```javascript
// Ruta pública (cualquiera puede acceder)
router.get('/products', async (req, res) => { ... });

// Ruta protegida (solo usuarios autenticados)
router.get('/orders/my', authRequired, async (req, res) => { ... });

// Ruta solo admin (solo administradores)
router.post('/products', authRequired, adminOnly, async (req, res) => { ... });
router.delete('/products/:id', authRequired, adminOnly, async (req, res) => { ... });
```

### En el Frontend

**Archivo: `frontend/lib/auth.ts`**

```typescript
// Obtiene el usuario desde el token JWT
export async function getUser() {
  const token = await getToken(); // Lee de AsyncStorage
  
  if (!token) return null;
  
  // Decodifica el JWT
  const payload = decodeJwt(token);
  
  // Retorna: { id, role, email, exp }
  return payload;
}

// Decodifica un JWT
export function decodeJwt(token: string) {
  const [, payload] = token.split('.');
  const json = JSON.parse(b64decode(payload));
  return json; // { id, role, email, exp }
}
```

**Uso en componentes:**

```typescript
// Archivo: frontend/app/(tabs)/perfil.tsx

export default function PerfilScreen() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const loadUser = async () => {
      const userData = await getUser();
      setUser(userData);
    };
    loadUser();
  }, []);
  
  // Si es ADMIN, mostrar botón de configuración
  if (user?.role === 'ADMIN') {
    return (
      <Pressable onPress={() => router.push('/admin-settings')}>
        <Text>⚙️ Configuración</Text>
      </Pressable>
    );
  }
  
  // Si es CUSTOMER, mostrar mis pedidos
  if (user?.role === 'CUSTOMER') {
    return (
      <Pressable onPress={() => router.push('/orders')}>
        <Text>📦 Mis Pedidos</Text>
      </Pressable>
    );
  }
}
```

**Archivo: `frontend/app/(tabs)/_layout.tsx`**

```typescript
export default function TabLayout() {
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    const loadRole = async () => {
      const user = await getUser();
      setUserRole(user?.role);
    };
    loadRole();
  }, []);
  
  // Si es ADMIN, mostrar tabs administrativos
  if (userRole === 'ADMIN') {
    return (
      <Tabs>
        <Tabs.Screen name="admin-products" options={{ title: '📦 Productos' }} />
        <Tabs.Screen name="admin-categories" options={{ title: '📂 Categorías' }} />
        <Tabs.Screen name="admin-users" options={{ title: '👥 Usuarios' }} />
        <Tabs.Screen name="admin-orders" options={{ title: '📋 Pedidos' }} />
      </Tabs>
    );
  }
  
  // Si es CUSTOMER, mostrar tabs normales
  return (
    <Tabs>
      <Tabs.Screen name="catalog" options={{ title: '🛍️ Catálogo' }} />
      <Tabs.Screen name="cart" options={{ title: '🛒 Carrito' }} />
      <Tabs.Screen name="orders" options={{ title: '📦 Pedidos' }} />
      <Tabs.Screen name="perfil" options={{ title: '👤 Perfil' }} />
    </Tabs>
  );
}
```

---

## 🔑 Estructura del JWT

Un JWT tiene 3 partes separadas por puntos:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB0aWVuZGEuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDA2MDAwMDB9.signature
│                                          │                                                                                                    │
└─ Header (algoritmo)                      └─ Payload (datos del usuario)                                                                      └─ Firma
```

**Payload decodificado:**
```json
{
  "id": 1,
  "email": "admin@tienda.com",
  "role": "ADMIN",
  "iat": 1700000000,
  "exp": 1700600000
}
```

- `id`: ID del usuario en la BD
- `role`: "ADMIN" o "CUSTOMER"
- `email`: Email del usuario
- `exp`: Fecha de expiración (7 días)

---

## 🔒 Seguridad

### Contraseñas
- ✅ Encriptadas con **bcryptjs** (10 rondas de salt)
- ✅ Nunca se guardan en texto plano
- ✅ Se comparan con `bcrypt.compare()`

### Tokens JWT
- ✅ Firmados con `JWT_SECRET` (variable de entorno)
- ✅ Expiran en 7 días
- ✅ Se validan en cada petición protegida
- ✅ Se guardan en **AsyncStorage** (persistente pero seguro)

### Rutas Protegidas
- ✅ Requieren token válido (`authRequired`)
- ✅ Rutas admin requieren rol ADMIN (`adminOnly`)
- ✅ Retornan 401 si no hay token
- ✅ Retornan 403 si no es admin

---

## 👥 Usuarios de Prueba

### Cliente
```
Email: cliente@tienda.com
Contraseña: cliente123
Rol: CUSTOMER
```

### Administrador
```
Email: admin@tienda.com
Contraseña: admin123
Rol: ADMIN
```

---

## 🔄 Cambio de Contraseña

```
Usuario autenticado → Frontend (perfil.tsx)
    ↓
    Envía: { oldPassword, newPassword }
    ↓
Backend (POST /auth/change)
    ↓
    Verifica token (authRequired)
    ↓
    Compara oldPassword con la BD
    ↓
    Si es correcto → Encripta newPassword
    ↓
    Actualiza en BD
    ↓
    Retorna: { message: 'Contraseña actualizada' }
```

---

## 🚪 Logout (Cerrar Sesión)

```
Usuario → Presiona "Cerrar sesión"
    ↓
Frontend (lib/auth.ts)
    ↓
    Ejecuta: clearToken()
    ↓
    Elimina token de AsyncStorage
    ↓
    Redirige a login
```

---

## 📊 Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React Native)                  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. Usuario ingresa email y contraseña               │  │
│  │ 2. Presiona "Iniciar Sesión"                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                         ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ lib/auth.ts → login(email, password)                │  │
│  │ Envía POST /auth/login                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ routes/auth.js → POST /auth/login                   │  │
│  │ 1. Valida email y contraseña                        │  │
│  │ 2. Busca usuario en BD                              │  │
│  │ 3. Compara contraseña con bcryptjs                  │  │
│  │ 4. Genera JWT con { id, role, email }              │  │
│  │ 5. Retorna { accessToken: "..." }                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React Native)                  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. Recibe token                                      │  │
│  │ 2. Guarda en AsyncStorage                           │  │
│  │ 3. Decodifica JWT                                   │  │
│  │ 4. Obtiene role: "ADMIN" o "CUSTOMER"              │  │
│  │ 5. Redirige según rol                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                         ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Si role === "ADMIN"                                 │  │
│  │ → Muestra tabs administrativos                      │  │
│  │                                                      │  │
│  │ Si role === "CUSTOMER"                              │  │
│  │ → Muestra catálogo de productos                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎓 Resumen

| Aspecto | Detalles |
|---------|----------|
| **Ubicación Backend** | `backend/api/src/routes/auth.js` |
| **Ubicación Frontend** | `frontend/lib/auth.ts` |
| **Método de Encriptación** | bcryptjs (10 rondas) |
| **Token** | JWT (7 días de expiración) |
| **Almacenamiento Token** | AsyncStorage (persistente) |
| **Identificación de Rol** | Campo `role` en JWT payload |
| **Protección de Rutas** | Middlewares `authRequired` y `adminOnly` |
| **Roles** | ADMIN, CUSTOMER |

