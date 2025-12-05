# 🎨 Sistema de Temas Dinámicos

## ✅ ¿QUÉ SE IMPLEMENTÓ?

Se agregó un sistema completo de temas que permite cambiar entre modo claro y oscuro con un botón.

---

## 📍 ARCHIVOS CREADOS

### 1. `frontend/context/ThemeContext.tsx`
Context que maneja el estado del tema y persiste en AsyncStorage.

**Funcionalidades:**
- Carga el tema guardado al iniciar
- Permite cambiar entre claro y oscuro
- Guarda el tema en AsyncStorage
- Proporciona hook `useTheme()` para usar en componentes

### 2. `frontend/components/ThemeToggle.tsx`
Componente reutilizable con el botón de cambio de tema.

**Uso:**
```typescript
<ThemeToggle size={24} color="#00A650" />
```

---

## 📝 ARCHIVOS MODIFICADOS

### 1. `frontend/app/_layout.tsx`
Se envolvió la app con `ThemeProvider` para que todos los componentes tengan acceso al tema.

```typescript
<CustomThemeProvider>
  <ThemeProvider value={DefaultTheme}>
    {/* ... resto de la app ... */}
  </ThemeProvider>
</CustomThemeProvider>
```

### 2. `frontend/app/(tabs)/perfil.tsx`
Se agregó botón de cambio de tema en el header del perfil (cliente).

**Ubicación:** Lado derecho del header, junto al botón de cerrar sesión.

**Icono:**
- Modo claro: 🌙 (luna)
- Modo oscuro: ☀️ (sol)

### 3. `frontend/app/(tabs)/admin-settings.tsx`
Se agregó botón de cambio de tema en el header de configuración (admin).

**Ubicación:** Lado derecho del header de configuración.

---

## 🎯 CÓMO FUNCIONA

### Flujo de Cambio de Tema

```
Usuario presiona botón
    ↓
toggleTheme() se ejecuta
    ↓
Tema cambia de 'light' a 'dark' (o viceversa)
    ↓
Se guarda en AsyncStorage
    ↓
Context notifica a todos los componentes
    ↓
Componentes se re-renderizan con nuevos colores
```

### Persistencia

```
Sesión 1:
- Usuario abre app (tema por defecto: light)
- Presiona botón → cambia a dark
- Se guarda en AsyncStorage

Sesión 2:
- Usuario abre app
- ThemeContext carga el tema guardado (dark)
- App inicia en modo oscuro
```

---

## 🎨 COLORES DISPONIBLES

### Tema Claro (Light)
```javascript
{
  text: '#333333',           // Texto oscuro
  background: '#FFFFFF',     // Fondo blanco
  tint: '#00A650',          // Verde (acento)
  icon: '#666666',          // Iconos grises
  tabIconDefault: '#999999', // Tabs inactivos
  tabIconSelected: '#00A650' // Tabs activos
}
```

### Tema Oscuro (Dark)
```javascript
{
  text: '#ECEDEE',           // Texto claro
  background: '#151718',     // Fondo oscuro
  tint: '#00A650',          // Verde (acento)
  icon: '#9BA1A6',          // Iconos grises claros
  tabIconDefault: '#9BA1A6', // Tabs inactivos
  tabIconSelected: '#00A650' // Tabs activos
}
```

---

## 💻 CÓMO USAR EN COMPONENTES

### Opción 1: Usar el Hook `useTheme()`

```typescript
import { useTheme } from '@/context/ThemeContext'

export default function MiComponente() {
  const { theme, colors, toggleTheme } = useTheme()
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hola</Text>
      <Pressable onPress={toggleTheme}>
        <Text>Cambiar tema</Text>
      </Pressable>
    </View>
  )
}
```

### Opción 2: Usar el Componente ThemeToggle

```typescript
import { ThemeToggle } from '@/components/ThemeToggle'

export default function MiComponente() {
  return (
    <View>
      <ThemeToggle size={24} color="#00A650" />
    </View>
  )
}
```

---

## 🔄 ACTUALIZAR COMPONENTES EXISTENTES

Para que un componente use los colores del tema dinámico:

**Antes:**
```typescript
<View style={{ backgroundColor: FalabellaColors.background }}>
  <Text style={{ color: FalabellaColors.text }}>Texto</Text>
</View>
```

**Después:**
```typescript
import { useTheme } from '@/context/ThemeContext'

export default function MiComponente() {
  const { colors } = useTheme()
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Texto</Text>
    </View>
  )
}
```

---

## 📱 DÓNDE ESTÁ EL BOTÓN

### Cliente (Perfil)
```
┌─────────────────────────────────────┐
│ Mi Perfil          🌙 🚪           │
│ usuario@email.com                   │
└─────────────────────────────────────┘
                ↑
        Botón de tema aquí
```

### Admin (Configuración)
```
┌─────────────────────────────────────┐
│ Configuración      🌙               │
│ Panel de administración              │
└─────────────────────────────────────┘
                ↑
        Botón de tema aquí
```

---

## 🚀 PRÓXIMAS MEJORAS (Opcional)

1. **Agregar más temas predefinidos**
   - Tema azul
   - Tema rojo
   - Tema personalizado

2. **Guardar preferencia en BD**
   - Guardar tema en `store_settings`
   - Todos los clientes ven el mismo tema

3. **Transiciones suaves**
   - Animar cambio de colores
   - Usar `Animated` de React Native

4. **Tema automático**
   - Detectar preferencia del sistema
   - Cambiar automáticamente según hora del día

---

## ✨ CARACTERÍSTICAS

- ✅ Cambio instantáneo de tema
- ✅ Persiste entre sesiones
- ✅ Disponible en cliente y admin
- ✅ Colores consistentes en toda la app
- ✅ Fácil de extender con más temas
- ✅ Sin necesidad de recompilar

---

## 🎯 RESUMEN

| Aspecto | Detalles |
|---------|----------|
| **Context** | `ThemeContext.tsx` |
| **Hook** | `useTheme()` |
| **Componente** | `ThemeToggle.tsx` |
| **Almacenamiento** | AsyncStorage |
| **Temas** | light, dark |
| **Ubicación Botón** | Perfil (cliente) y Configuración (admin) |
| **Persistencia** | Sí, entre sesiones |

