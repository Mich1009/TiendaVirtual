# 📝 Registro de Usuarios - ADMIN vs CLIENTE

## 📍 Ubicación de Archivos

### Backend
```
backend/api/src/
├── routes/
│   ├── auth.js          ← Registro público (CLIENTE)
│   └── users.js         ← Crear usuarios (ADMIN)
└── validation/
    └── users.js         ← Validación de datos
```

### Frontend
```
frontend/app/
├── register.tsx         ← Pantalla de registro (CLIENTE)
└── (tabs)/
    └── admin-users.tsx  ← Gestión de usuarios (ADMIN)
```

---

## 🎯 DOS FORMAS DE REGISTRAR USUARIOS

### **1️⃣ REGISTRO PÚBLICO (CLIENTE)**

#### Cómo funciona:
- Cualquiera puede registrarse sin autenticación
- Se crea automáticamente con rol **CUSTOMER**
- No requiere token JWT

#### Backend: `backend/api/src/routes/auth.js`

```javascript
router.post('/register', async (req, res, next) => {
  try {
    // 1. Valida datos
    const { value, error } = registerSchema.validate(req.body);
    if (error) return res.status(422).json({ error: { code: 'VALIDATION', message: error.message } });
    
    // 2. Verifica que el email no existe
    const exists = await User.query().findOne({ email: value.email });
    if (exists) return res.status(409).json({ error: { code: 'CONFLICT', message: 'Email ya registrado' } });
    
    // 3. Encripta la contraseña
    const password_hash = await bcrypt.hash(value.password, 10);
    
    // 4. Crea el usuario con rol CUSTOMER (IMPORTANTE)
    const user = await User.query().insert({ 
      name: value.name, 
      email: value.email, 
      password_hash, 
      role: 'CUSTOMER'  // ← Siempre CUSTOMER
    });
    
    // 5. Retorna los datos del usuario
    return res.status(201).json({ 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role 
    });
  } catch (err) {
    next(err);
  }
});
```

#### Frontend: `frontend/app/register.tsx`

```typescript
export default function RegistrarseScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  async function manejarRegistro() {
    try {
      // Validaciones locales
      if (!name || !email || !password || !confirmPassword) {
        setError('Por favor completa todos los campos');
        return;
      }

      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }

      // Envía POST /auth/register
      await register(name, email, password);
      
      // Redirige a login
      router.replace('/login');
    } catch (e: any) {
      setError(e.message || 'Error de registro');
    }
  }

  return (
    <View>
      <TextInput placeholder="Nombre" value={name} onChangeText={setName} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput placeholder="Confirmar" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
      <Pressable onPress={manejarRegistro}>
        <Text>Crear cuenta</Text>
      </Pressable>
    </View>
  );
}
```

#### Flujo Completo:

```
Usuario en app
    ↓
Presiona "Crear cuenta"
    ↓
Ingresa: nombre, email, contraseña
    ↓
Frontend valida datos localmente
    ↓
Envía POST /auth/register
    ↓
Backend valida y crea usuario con role: 'CUSTOMER'
    ↓
Retorna: { id, name, email, role: 'CUSTOMER' }
    ↓
Frontend redirige a login
    ↓
Usuario inicia sesión
    ↓
Obtiene token JWT con role: 'CUSTOMER'
    ↓
Ve catálogo de productos
```

---

### **2️⃣ CREAR USUARIO DESDE ADMIN**

#### Cómo funciona:
- Solo ADMIN puede crear usuarios
- Puede crear con rol **ADMIN** o **CUSTOMER**
- Requiere token JWT de administrador
- Puede generar contraseña automática

#### Backend: `backend/api/src/routes/users.js`

```javascript
// Crear usuario (solo ADMIN)
router.post('/', authRequired, adminOnly, async (req, res, next) => {
  try {
    // 1. Valida datos
    const { value, error } = userCreateSchema.validate(req.body);
    if (error) return res.status(422).json({ error: { code: 'VALIDATION', message: error.message } });
    
    // 2. Verifica que el email no existe
    const exists = await User.query().findOne({ email: value.email });
    if (exists) return res.status(409).json({ error: { code: 'CONFLICT', message: 'Email ya registrado' } });

    // 3. Si no proporciona contraseña, genera una automática
    let rawPassword = value.password;
    if (!rawPassword) rawPassword = generatePassword(); // Genera: "aB3$xY9@mK"
    
    // 4. Encripta la contraseña
    const password_hash = await bcrypt.hash(rawPassword, 10);
    
    // 5. Crea el usuario con el rol especificado
    const user = await User.query().insert({
      name: value.name,
      email: value.email,
      password_hash,
      role: value.role,  // ← ADMIN o CUSTOMER (lo elige el admin)
    });
    
    // 6. Retorna los datos (incluye contraseña si fue generada)
    res.status(201).json({ 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      generatedPassword: value.password ? undefined : rawPassword  // ← Contraseña temporal
    });
  } catch (err) { 
    next(err); 
  }
});
```

#### Frontend: `frontend/app/(tabs)/admin-users.tsx`

```typescript
export default function AdminUsuariosScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER' as 'CUSTOMER' | 'ADMIN'
  });

  async function confirmarCrear() {
    try {
      const token = await getToken();
      
      // Envía POST /users con token de admin
      const response = await createUser(token, {
        name: formData.name,
        email: formData.email,
        password: formData.password || undefined,  // Si está vacío, backend genera una
        role: formData.role  // ADMIN o CUSTOMER
      });

      // Si se generó contraseña, muestra al admin
      if (response.generatedPassword) {
        Alert.alert(
          'Usuario creado',
          `Contraseña temporal: ${response.generatedPassword}\n\nComparte esto con el usuario.`
        );
      }

      setShowCreateModal(false);
      cargarUsuarios();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al crear usuario');
    }
  }

  return (
    <View>
      {/* Selector de rol */}
      <Pressable
        onPress={() => setFormData({ ...formData, role: 'CUSTOMER' })}
        style={[
          styles.roleOption,
          formData.role === 'CUSTOMER' && styles.roleOptionSelected
        ]}
      >
        <Text>👤 Cliente</Text>
      </Pressable>

      <Pressable
        onPress={() => setFormData({ ...formData, role: 'ADMIN' })}
        style={[
          styles.roleOption,
          formData.role === 'ADMIN' && styles.roleOptionSelected
        ]}
      >
        <Text>🔑 Administrador</Text>
      </Pressable>

      {/* Campos de entrada */}
      <TextInput
        placeholder="Nombre"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />
      <TextInput
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
      />
      <TextInput
        placeholder="Contraseña (opcional)"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        secureTextEntry
      />

      <Pressable onPress={confirmarCrear}>
        <Text>Crear usuario</Text>
      </Pressable>
    </View>
  );
}
```

#### Flujo Completo:

```
Admin en app
    ↓
Presiona "Crear usuario"
    ↓
Ingresa: nombre, email, rol (ADMIN o CUSTOMER)
    ↓
Puede dejar contraseña vacía (se genera automática)
    ↓
Presiona "Crear"
    ↓
Frontend envía POST /users con token de admin
    ↓
Backend verifica que es ADMIN (authRequired + adminOnly)
    ↓
Crea usuario con el rol especificado
    ↓
Si no hay contraseña → genera una automática
    ↓
Retorna: { id, name, email, role, generatedPassword }
    ↓
Frontend muestra la contraseña temporal al admin
    ↓
Admin comparte contraseña con el nuevo usuario
    ↓
Nuevo usuario inicia sesión con esa contraseña
    ↓
Obtiene token con su rol (ADMIN o CUSTOMER)
```

---

## 📊 COMPARACIÓN

| Aspecto | Registro Público (Cliente) | Crear desde Admin |
|---------|---------------------------|------------------|
| **Quién puede hacerlo** | Cualquiera | Solo ADMIN |
| **Requiere token** | ❌ No | ✅ Sí |
| **Rol asignado** | Siempre CUSTOMER | ADMIN o CUSTOMER |
| **Contraseña** | Usuario la ingresa | Admin la ingresa o se genera |
| **Endpoint** | POST /auth/register | POST /users |
| **Protección** | Ninguna | authRequired + adminOnly |
| **Caso de uso** | Clientes nuevos | Crear admins o clientes especiales |

---

## 🔐 VALIDACIÓN DE DATOS

### Backend: `backend/api/src/validation/users.js`

```javascript
const userCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).optional(),  // Opcional, se genera si falta
  role: Joi.string().valid('ADMIN', 'CUSTOMER').required()
});

const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid('ADMIN', 'CUSTOMER').optional(),
  resetPassword: Joi.boolean().optional()  // Para resetear contraseña
});
```

---

## 🎯 CASOS DE USO

### Caso 1: Cliente se registra por su cuenta
```
1. Abre la app
2. Presiona "Crear cuenta"
3. Ingresa nombre, email, contraseña
4. Se crea con role: CUSTOMER
5. Inicia sesión
6. Ve catálogo de productos
```

### Caso 2: Admin crea otro admin
```
1. Admin inicia sesión
2. Va a "Gestión de Usuarios"
3. Presiona "Crear usuario"
4. Ingresa nombre, email
5. Selecciona rol: ADMIN
6. Deja contraseña vacía (se genera)
7. Presiona "Crear"
8. Backend genera contraseña: "aB3$xY9@mK"
9. Admin ve la contraseña y la comparte
10. Nuevo admin inicia sesión con esa contraseña
```

### Caso 3: Admin crea cliente especial
```
1. Admin inicia sesión
2. Va a "Gestión de Usuarios"
3. Presiona "Crear usuario"
4. Ingresa nombre, email
5. Selecciona rol: CUSTOMER
6. Ingresa contraseña manualmente
7. Presiona "Crear"
8. Cliente inicia sesión con esa contraseña
```

---

## 🔄 GENERACIÓN AUTOMÁTICA DE CONTRASEÑA

```javascript
function generatePassword(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@$%&*';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

// Ejemplos de contraseñas generadas:
// "aB3$xY9@mK"
// "Pq7*Rt2&Ks"
// "Mn5@Vw8$Xy"
```

---

## 📱 PANTALLAS EN LA APP

### Pantalla de Registro (Cliente)
```
┌─────────────────────────────┐
│  Tienda                     │
│  Crea tu cuenta             │
├─────────────────────────────┤
│ Nombre completo             │
│ [________________]          │
│                             │
│ Correo electrónico          │
│ [________________]          │
│                             │
│ Contraseña                  │
│ [________________] 👁️       │
│                             │
│ Confirmar contraseña        │
│ [________________] 👁️       │
│                             │
│ [  Crear cuenta  ]          │
│                             │
│ ─────── o ───────           │
│ [ Ya tengo cuenta ]         │
└─────────────────────────────┘
```

### Pantalla de Gestión de Usuarios (Admin)
```
┌─────────────────────────────┐
│ ← Usuarios                  │
├─────────────────────────────┤
│ 👤 Juan Pérez               │
│    cliente@tienda.com       │
│    Cliente                  │
│    [✏️] [🗑️]               │
│                             │
│ 🔑 María García             │
│    admin@tienda.com         │
│    Administrador            │
│    [✏️] [🗑️]               │
│                             │
│ [+ Crear usuario]           │
└─────────────────────────────┘

Modal de Crear Usuario:
┌─────────────────────────────┐
│ Nuevo Usuario               │
├─────────────────────────────┤
│ Nombre: [________________]  │
│ Email:  [________________]  │
│ Contraseña: [____________]  │
│ (dejar vacío para generar)  │
│                             │
│ Rol:                        │
│ [👤 Cliente] [🔑 Admin]    │
│                             │
│ [Cancelar] [Crear]          │
└─────────────────────────────┘
```

---

## 🚀 RESUMEN

**Registro Público (Cliente):**
- Endpoint: `POST /auth/register`
- Rol: Siempre `CUSTOMER`
- Contraseña: Usuario la ingresa
- Protección: Ninguna

**Crear desde Admin:**
- Endpoint: `POST /users`
- Rol: `ADMIN` o `CUSTOMER` (elige el admin)
- Contraseña: Admin la ingresa o se genera automática
- Protección: `authRequired` + `adminOnly`

