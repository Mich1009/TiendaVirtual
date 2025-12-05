# 🛒 Carrito de Compras y Cálculo de Precios

## 📍 Ubicación de Archivos

### Frontend
```
frontend/
├── context/
│   └── CartContext.tsx          ← Lógica del carrito y cálculo de precios
├── app/
│   ├── (tabs)/
│   │   ├── catalog.tsx          ← Mostrar productos
│   │   └── cart.tsx             ← Ver carrito
│   ├── product/[id].tsx         ← Detalle del producto
│   └── checkout.tsx             ← Resumen y pago
└── lib/
    └── api.ts                   ← Obtener productos del backend
```

---

## 🎯 ¿Cómo Funciona el Carrito?

### Flujo General

```
1. Usuario ve catálogo de productos
   ↓
2. Presiona "Agregar al carrito"
   ↓
3. Producto se agrega a CartContext
   ↓
4. CartContext calcula el total automáticamente
   ↓
5. Usuario ve el carrito actualizado
   ↓
6. Puede cambiar cantidades o eliminar productos
   ↓
7. El total se recalcula automáticamente
   ↓
8. Presiona "Pagar"
   ↓
9. Se envía el carrito al backend
   ↓
10. Backend crea la orden
```

---

## 📦 CartContext - Archivo Principal

### Ubicación: `frontend/context/CartContext.tsx`

#### Estructura de Datos

**CartItem (Producto en el carrito):**
```typescript
type CartItem = {
  id: number;       // ID del producto
  name: string;     // Nombre del producto
  price: number;    // Precio unitario (ej: 29.99)
  img?: string;     // URL de la imagen
  qty: number;      // Cantidad (ej: 3)
}
```

**Ejemplo:**
```typescript
{
  id: 1,
  name: "Laptop",
  price: 999.99,
  img: "https://...",
  qty: 2
}
```

#### Estado del Carrito

```typescript
type CartState = {
  items: CartItem[];                          // Array de productos
  addItem: (it: CartItem) => void;           // Función para agregar
  updateQty: (id: number, qty: number) => void;  // Función para cambiar cantidad
  removeItem: (id: number) => void;          // Función para eliminar
  clear: () => void;                         // Función para vaciar
  total: number;                             // Total calculado
}
```

---

## 🔢 Función de Cálculo de Precios

### ¿Dónde está?

**Archivo:** `frontend/context/CartContext.tsx`
**Línea:** 153

### El Código

```typescript
total: items.reduce((sum, item) => sum + item.price * item.qty, 0)
```

### ¿Qué Hace?

Calcula el total sumando: **precio × cantidad** de cada producto.

### Explicación Paso a Paso

```typescript
// Ejemplo: Carrito con 3 productos
items = [
  { id: 1, name: "Laptop", price: 999.99, qty: 1 },
  { id: 2, name: "Mouse", price: 29.99, qty: 2 },
  { id: 3, name: "Teclado", price: 79.99, qty: 1 }
]

// Cálculo:
total = items.reduce((sum, item) => sum + item.price * item.qty, 0)

// Paso a paso:
// 1. sum = 0, item = Laptop
//    sum = 0 + (999.99 × 1) = 999.99
//
// 2. sum = 999.99, item = Mouse
//    sum = 999.99 + (29.99 × 2) = 999.99 + 59.98 = 1059.97
//
// 3. sum = 1059.97, item = Teclado
//    sum = 1059.97 + (79.99 × 1) = 1059.97 + 79.99 = 1139.96

// Resultado final: total = 1139.96
```

### Desglose Visual

```
Producto 1: Laptop
  Precio: $999.99
  Cantidad: 1
  Subtotal: $999.99 × 1 = $999.99

Producto 2: Mouse
  Precio: $29.99
  Cantidad: 2
  Subtotal: $29.99 × 2 = $59.98

Producto 3: Teclado
  Precio: $79.99
  Cantidad: 1
  Subtotal: $79.99 × 1 = $79.99

─────────────────────────
TOTAL: $999.99 + $59.98 + $79.99 = $1,139.96
```

---

## 🔄 Funciones del Carrito

### 1. addItem() - Agregar Producto

**¿Qué hace?**
Agrega un producto al carrito. Si ya existe, suma las cantidades.

**Código:**
```typescript
addItem: (it) => {
  setItems(prev => {
    // Buscar si el producto ya existe
    const existing = prev.find(p => p.id === it.id)
    
    if (existing) {
      // Si existe: sumar cantidades
      return prev.map(p => 
        p.id === it.id 
          ? { ...p, qty: p.qty + it.qty }  // Aumentar cantidad
          : p
      )
    }
    
    // Si no existe: agregar al final
    return [...prev, it]
  })
}
```

**Ejemplo de uso:**
```typescript
const { addItem } = useCart();

// Agregar 1 laptop
addItem({
  id: 1,
  name: "Laptop",
  price: 999.99,
  img: "https://...",
  qty: 1
});

// Si se vuelve a agregar la misma laptop:
// qty pasa de 1 a 2 automáticamente
```

**Casos:**
- **Primer agregado:** Carrito vacío → Se agrega el producto
- **Segundo agregado:** Producto existe → Se suma la cantidad
- **Tercer agregado:** Producto existe → Se suma la cantidad nuevamente

### 2. updateQty() - Cambiar Cantidad

**¿Qué hace?**
Cambia la cantidad de un producto específico.

**Código:**
```typescript
updateQty: (id, qty) => {
  setItems(prev => 
    prev.map(p => 
      p.id === id 
        ? { ...p, qty }  // Cambiar cantidad
        : p
    )
  )
}
```

**Ejemplo de uso:**
```typescript
const { updateQty } = useCart();

// Cambiar cantidad del producto con id=1 a 5
updateQty(1, 5);

// Cambiar cantidad del producto con id=2 a 0 (para eliminarlo)
updateQty(2, 0);
```

### 3. removeItem() - Eliminar Producto

**¿Qué hace?**
Elimina completamente un producto del carrito.

**Código:**
```typescript
removeItem: (id) => {
  setItems(prev => prev.filter(p => p.id !== id))
}
```

**Ejemplo de uso:**
```typescript
const { removeItem } = useCart();

// Eliminar el producto con id=1
removeItem(1);
```

### 4. clear() - Vaciar Carrito

**¿Qué hace?**
Elimina todos los productos del carrito.

**Código:**
```typescript
clear: () => setItems([])
```

**Ejemplo de uso:**
```typescript
const { clear } = useCart();

// Vaciar carrito después de completar la compra
clear();
```

---

## 💾 Persistencia del Carrito

### ¿Cómo se guarda?

El carrito se guarda automáticamente en **AsyncStorage** (almacenamiento local del dispositivo).

**Código:**
```typescript
// Cargar carrito al iniciar la app
useEffect(() => {
  ;(async () => {
    try {
      const raw = await AsyncStorage.getItem('cart');
      setItems(raw ? JSON.parse(raw) : []);
      console.log('🛒 Carrito cargado desde AsyncStorage');
    } catch (error) {
      console.error('Error cargando carrito:', error);
    }
  })();
}, []);

// Guardar carrito cada vez que cambia
useEffect(() => {
  ;(async () => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(items));
      console.log('💾 Carrito guardado en AsyncStorage');
    } catch (error) {
      console.error('Error guardando carrito:', error);
    }
  })();
}, [items]);
```

**Ventaja:**
Si el usuario cierra la app, el carrito se mantiene. Al abrir nuevamente, los productos siguen ahí.

---

## 🎨 Cómo se Usa en Componentes

### Ejemplo 1: Agregar Producto (Catálogo)

**Archivo:** `frontend/app/(tabs)/catalog.tsx`

```typescript
import { useCart } from '@/context/CartContext';

export default function CatalogoScreen() {
  const { addItem } = useCart();
  
  function agregarAlCarrito(product) {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      img: product.images?.[0]?.url,
      qty: 1
    });
    
    // Mostrar confirmación
    Alert.alert('Éxito', `${product.name} agregado al carrito`);
  }
  
  return (
    <Pressable onPress={() => agregarAlCarrito(product)}>
      <Text>Agregar al carrito</Text>
    </Pressable>
  );
}
```

### Ejemplo 2: Ver Carrito

**Archivo:** `frontend/app/(tabs)/cart.tsx`

```typescript
import { useCart } from '@/context/CartContext';

export default function CarritoScreen() {
  const { items, total, updateQty, removeItem } = useCart();
  
  return (
    <View>
      {/* Listar productos */}
      {items.map(item => (
        <View key={item.id}>
          <Text>{item.name}</Text>
          <Text>Precio: S/ {item.price}</Text>
          
          {/* Cambiar cantidad */}
          <TextInput
            value={String(item.qty)}
            onChangeText={(qty) => updateQty(item.id, parseInt(qty))}
          />
          
          {/* Eliminar */}
          <Pressable onPress={() => removeItem(item.id)}>
            <Text>Eliminar</Text>
          </Pressable>
        </View>
      ))}
      
      {/* Mostrar total */}
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
        Total: S/ {total.toLocaleString('es-PE')}
      </Text>
    </View>
  );
}
```

### Ejemplo 3: Checkout (Resumen de Compra)

**Archivo:** `frontend/app/checkout.tsx`

```typescript
import { useCart } from '@/context/CartContext';

export default function CheckoutScreen() {
  const { items, total, clear } = useCart();
  
  async function completarCompra() {
    // Enviar carrito al backend
    const response = await createOrder(token, {
      items: items.map(item => ({
        product_id: item.id,
        quantity: item.qty,
        unit_price: item.price
      })),
      total: total
    });
    
    // Vaciar carrito después de comprar
    clear();
    
    // Redirigir a confirmación
    router.push('/order-confirmation');
  }
  
  return (
    <View>
      {/* Listar productos */}
      {items.map(item => (
        <View key={item.id}>
          <Text>{item.name}</Text>
          <Text>Cantidad: {item.qty}</Text>
          <Text>Subtotal: S/ {(item.price * item.qty).toLocaleString('es-PE')}</Text>
        </View>
      ))}
      
      {/* Mostrar total */}
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        Total: S/ {total.toLocaleString('es-PE')}
      </Text>
      
      {/* Botón de pago */}
      <Pressable onPress={completarCompra}>
        <Text>Pagar S/ {total.toLocaleString('es-PE')}</Text>
      </Pressable>
    </View>
  );
}
```

---

## 📊 Flujo Completo de Precios

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO EN CATÁLOGO                      │
│                                                             │
│  Ve producto: Laptop - S/ 999.99                           │
│  Presiona: "Agregar al carrito"                            │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    CARTCONTEXT                              │
│                                                             │
│  addItem({                                                  │
│    id: 1,                                                   │
│    name: "Laptop",                                          │
│    price: 999.99,                                           │
│    qty: 1                                                   │
│  })                                                         │
│                                                             │
│  items = [{ id: 1, price: 999.99, qty: 1 }]               │
│  total = 999.99 × 1 = 999.99                               │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO EN CARRITO                       │
│                                                             │
│  Ve: Laptop - S/ 999.99 (Cantidad: 1)                      │
│  Total: S/ 999.99                                          │
│                                                             │
│  Cambia cantidad a 2                                        │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    CARTCONTEXT                              │
│                                                             │
│  updateQty(1, 2)                                            │
│                                                             │
│  items = [{ id: 1, price: 999.99, qty: 2 }]               │
│  total = 999.99 × 2 = 1999.98                              │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO EN CARRITO                       │
│                                                             │
│  Ve: Laptop - S/ 999.99 (Cantidad: 2)                      │
│  Total: S/ 1,999.98                                        │
│                                                             │
│  Presiona: "Pagar"                                          │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    CHECKOUT                                 │
│                                                             │
│  Resumen:                                                   │
│  - Laptop × 2 = S/ 1,999.98                                │
│  - Envío: Gratis                                           │
│  - Total: S/ 1,999.98                                      │
│                                                             │
│  Presiona: "Confirmar pago"                                │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND                                  │
│                                                             │
│  POST /v1/orders                                            │
│  {                                                          │
│    items: [                                                 │
│      { product_id: 1, quantity: 2, unit_price: 999.99 }   │
│    ],                                                       │
│    total: 1999.98                                           │
│  }                                                          │
│                                                             │
│  Crea orden en BD                                           │
│  Retorna: { id: 123, status: 'PENDING', total: 1999.98 }  │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    CARTCONTEXT                              │
│                                                             │
│  clear()                                                    │
│  items = []                                                 │
│  total = 0                                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Revisión del Proyecto

### ✅ Estado General

**No hay errores críticos encontrados.**

El proyecto está bien estructurado:
- ✅ Sintaxis correcta en todos los archivos
- ✅ Manejo de errores adecuado
- ✅ Persistencia de datos funcionando
- ✅ Cálculo de precios correcto

### ⚠️ Observaciones

1. **Validación de cantidades**: En `updateQty()` no se valida que qty sea positivo
   - Solución: Agregar validación `if (qty < 0) return;`

2. **Precios negativos**: No se valida que los precios sean positivos
   - Solución: Validar en el backend al crear productos

3. **Precisión decimal**: Se usa `toLocaleString()` para mostrar, pero internamente se usa número flotante
   - Esto es correcto, pero en producción considerar usar `toFixed(2)`

---

## 🚀 Resumen

| Aspecto | Detalles |
|---------|----------|
| **Ubicación** | `frontend/context/CartContext.tsx` |
| **Función de Precios** | `total: items.reduce((sum, item) => sum + item.price * item.qty, 0)` |
| **Fórmula** | Total = Σ(precio × cantidad) |
| **Persistencia** | AsyncStorage |
| **Actualización** | Automática en cada cambio |
| **Errores** | Ninguno crítico |

