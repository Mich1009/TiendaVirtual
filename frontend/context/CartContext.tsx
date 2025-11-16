import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type CartItem = { id: number; name: string; price: number; img?: string; qty: number }

type CartState = {
  items: CartItem[]
  addItem: (it: CartItem) => void
  updateQty: (id: number, qty: number) => void
  removeItem: (id: number) => void
  clear: () => void
  total: number
}

const Ctx = createContext<CartState | null>(null)

export function CartProvider({ children }: { children: any }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const raw = await AsyncStorage.getItem('cart')
        setItems(raw ? JSON.parse(raw) : [])
      } catch {}
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        await AsyncStorage.setItem('cart', JSON.stringify(items))
      } catch {}
    })()
  }, [items])

  const api: CartState = useMemo(() => ({
    items,
    addItem: (it) => {
      setItems(prev => {
        const existing = prev.find(p => p.id === it.id)
        if (existing) return prev.map(p => p.id === it.id ? { ...p, qty: p.qty + it.qty } : p)
        return [...prev, it]
      })
    },
    updateQty: (id, qty) => {
      setItems(prev => prev.map(p => p.id === id ? { ...p, qty } : p))
    },
    removeItem: (id) => {
      setItems(prev => prev.filter(p => p.id !== id))
    },
    clear: () => setItems([]),
    total: items.reduce((s, i) => s + i.price * i.qty, 0)
  }), [items])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useCart() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('CartProvider requerido')
  return ctx
}