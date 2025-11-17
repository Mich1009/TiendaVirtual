/**
 * Contexto del Carrito de Compras
 * 
 * Maneja el estado global del carrito de compras con persistencia
 * Los productos se guardan en AsyncStorage para mantenerlos entre sesiones
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
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

// Crear el contexto del carrito
const Ctx = createContext<CartState | null>(null)

/**
 * Proveedor del contexto del carrito
 * Debe envolver toda la aplicación para proporcionar acceso al carrito
 */
export function CartProvider({ children }: { children: any }) {
  // Estado local que contiene los productos del carrito
  const [items, setItems] = useState<CartItem[]>([])

  // Efecto para cargar el carrito desde AsyncStorage al iniciar
  useEffect(() => {
    ;(async () => {
      try {
        const raw = await AsyncStorage.getItem('cart')
        setItems(raw ? JSON.parse(raw) : [])
        console.log('🛒 Carrito cargado desde AsyncStorage')
      } catch (error) {
        console.error('Error cargando carrito:', error)
      }
    })()
  }, [])

  // Efecto para guardar el carrito en AsyncStorage cada vez que cambie
  useEffect(() => {
    ;(async () => {
      try {
        await AsyncStorage.setItem('cart', JSON.stringify(items))
        console.log('💾 Carrito guardado en AsyncStorage')
      } catch (error) {
        console.error('Error guardando carrito:', error)
      }
    })()
  }, [items])

  // API del carrito con todas las funciones disponibles
  const api: CartState = useMemo(() => ({
    items,
    
    /**
     * Agregar un producto al carrito
     * Si el producto ya existe, suma las cantidades
     */
    addItem: (it) => {
      setItems(prev => {
        const existing = prev.find(p => p.id === it.id)
        if (existing) {
          // Producto existe: sumar cantidades
          return prev.map(p => p.id === it.id ? { ...p, qty: p.qty + it.qty } : p)
        }
        // Producto nuevo: agregarlo al carrito
        return [...prev, it]
      })
    },
    
    /**
     * Actualizar la cantidad de un producto específico
     * Si la cantidad es 0 o menor, el producto se mantiene (no se elimina automáticamente)
     */
    updateQty: (id, qty) => {
      setItems(prev => prev.map(p => p.id === id ? { ...p, qty } : p))
    },
    
    /**
     * Eliminar completamente un producto del carrito
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
     * Suma el precio * cantidad de todos los productos
     */
    total: items.reduce((sum, item) => sum + item.price * item.qty, 0)
  }), [items])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

/**
 * Hook para usar el carrito en cualquier componente
 * Debe usarse dentro de un CartProvider
 * 
 * @returns API del carrito con items, funciones y total
 * @throws Error si se usa fuera del CartProvider
 */
export function useCart() {
  const ctx = useContext(Ctx)
  if (!ctx) {
    throw new Error('useCart debe usarse dentro de un CartProvider')
  }
  return ctx
}