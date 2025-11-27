/**
 * Contexto del Carrito de Compras
 * 
 * Maneja el estado global del carrito de compras con persistencia
 * Los productos se guardan en AsyncStorage para mantenerlos entre sesiones
 * 
 * Uso:
 * 1. Envolver la app con <CartProvider>
 * 2. Usar el hook useCart() en cualquier componente
 */

// Importar hooks de React
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// Importar AsyncStorage para persistencia de datos
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Tipo que define un producto en el carrito
 */
export type CartItem = { 
  id: number      // ID único del producto
  name: string    // Nombre del producto
  price: number   // Precio unitario
  img?: string    // URL de la imagen (opcional)
  qty: number     // Cantidad seleccionada
}

/**
 * Tipo que define el estado y acciones del carrito
 */
type CartState = {
  items: CartItem[]                                    // Lista de productos en el carrito
  addItem: (it: CartItem) => void                     // Agregar producto al carrito
  updateQty: (id: number, qty: number) => void        // Actualizar cantidad de un producto
  removeItem: (id: number) => void                    // Eliminar producto del carrito
  clear: () => void                                   // Vaciar carrito completamente
  total: number                                       // Total calculado del carrito
}

// ============ CREAR CONTEXTO ============
// Crear el contexto del carrito (inicialmente null)
const Ctx = createContext<CartState | null>(null)

/**
 * Proveedor del contexto del carrito
 * Debe envolver toda la aplicación para proporcionar acceso al carrito
 * 
 * Ejemplo:
 * <CartProvider>
 *   <App />
 * </CartProvider>
 */
export function CartProvider({ children }: { children: any }) {
  // ============ ESTADO ============
  // Estado local que contiene los productos del carrito
  const [items, setItems] = useState<CartItem[]>([])

  // ============ CARGAR CARRITO AL INICIAR ============
  // Efecto para cargar el carrito desde AsyncStorage cuando se monta el componente
  useEffect(() => {
    ;(async () => {
      try {
        // Obtener carrito guardado de AsyncStorage
        const raw = await AsyncStorage.getItem('cart')
        
        // Si existe, parsear JSON; si no, usar array vacío
        setItems(raw ? JSON.parse(raw) : [])
        console.log('🛒 Carrito cargado desde AsyncStorage')
      } catch (error) {
        console.error('Error cargando carrito:', error)
      }
    })()
  }, [])

  // ============ GUARDAR CARRITO CUANDO CAMBIA ============
  // Efecto para guardar el carrito en AsyncStorage cada vez que cambie
  useEffect(() => {
    ;(async () => {
      try {
        // Guardar carrito como JSON en AsyncStorage
        await AsyncStorage.setItem('cart', JSON.stringify(items))
        console.log('💾 Carrito guardado en AsyncStorage')
      } catch (error) {
        console.error('Error guardando carrito:', error)
      }
    })()
  }, [items])

  // ============ API DEL CARRITO ============
  // Crear objeto con todas las funciones disponibles del carrito
  // useMemo evita recrear el objeto en cada render
  const api: CartState = useMemo(() => ({
    items,
    
    /**
     * Agregar un producto al carrito
     * Si el producto ya existe, suma las cantidades
     * Si es nuevo, lo agrega al final
     */
    addItem: (it) => {
      setItems(prev => {
        // Buscar si el producto ya existe en el carrito
        const existing = prev.find(p => p.id === it.id)
        
        if (existing) {
          // Producto existe: sumar cantidades
          return prev.map(p => 
            p.id === it.id 
              ? { ...p, qty: p.qty + it.qty }  // Aumentar cantidad
              : p
          )
        }
        
        // Producto nuevo: agregarlo al carrito
        return [...prev, it]
      })
    },
    
    /**
     * Actualizar la cantidad de un producto específico
     * Permite cambiar la cantidad a cualquier valor (incluso 0)
     */
    updateQty: (id, qty) => {
      setItems(prev => 
        prev.map(p => 
          p.id === id 
            ? { ...p, qty }  // Actualizar cantidad
            : p
        )
      )
    },
    
    /**
     * Eliminar completamente un producto del carrito
     * Filtra el producto por ID
     */
    removeItem: (id) => {
      setItems(prev => prev.filter(p => p.id !== id))
    },
    
    /**
     * Vaciar completamente el carrito
     * Se usa después de completar una compra
     */
    clear: () => setItems([]),
    
    /**
     * Total calculado del carrito
     * Suma: precio * cantidad de todos los productos
     * Ejemplo: 2 productos a $10 c/u = $20 total
     */
    total: items.reduce((sum, item) => sum + item.price * item.qty, 0)
  }), [items])

  // ============ PROVEEDOR ============
  // Proporcionar el contexto a todos los componentes hijos
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

/**
 * Hook para usar el carrito en cualquier componente
 * Debe usarse dentro de un CartProvider
 * 
 * Ejemplo:
 * const { items, addItem, total } = useCart()
 * 
 * @returns API del carrito con items, funciones y total
 * @throws Error si se usa fuera del CartProvider
 */
export function useCart() {
  // Obtener el contexto
  const ctx = useContext(Ctx)
  
  // Validar que se está usando dentro del CartProvider
  if (!ctx) {
    throw new Error('useCart debe usarse dentro de un CartProvider')
  }
  
  return ctx
}