import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { CartItem, Product } from '../types/Product'

type AddItemInput = {
  product: Product
  quantity: number
  selectedColor?: string
  selectedSize?: string
  unitPrice?: number // si no viene, uso product.basePrice
}

interface CartContextValue {
  items: CartItem[]
  count: number
  total: number
  addItem: (input: AddItemInput) => void
  updateQuantity: (productId: number, quantity: number, selectedColor?: string, selectedSize?: string) => void
  removeItem: (productId: number, selectedColor?: string, selectedSize?: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)
const STORAGE_KEY = 'swag_cart_v1'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try { setItems(JSON.parse(raw)) } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem: CartContextValue['addItem'] = ({ product, quantity, selectedColor, selectedSize, unitPrice }) => {
    if (quantity <= 0) return
    const keyMatch = (ci: CartItem) =>
      ci.id === product.id &&
      ci.selectedColor === (selectedColor ?? ci.selectedColor) &&
      ci.selectedSize === (selectedSize ?? ci.selectedSize)

    setItems(prev => {
      const idx = prev.findIndex(keyMatch)
      const price = unitPrice ?? product.basePrice
      if (idx >= 0) {
        const updated = [...prev]
        const mergedQty = updated[idx].quantity + quantity
        updated[idx] = {
          ...updated[idx],
          quantity: mergedQty,
          unitPrice: price,
          totalPrice: price * mergedQty,
        }
        return updated
      }
      const newItem: CartItem = {
        ...product,
        quantity,
        selectedColor,
        selectedSize,
        unitPrice: price,
        totalPrice: price * quantity,
      }
      return [...prev, newItem]
    })
  }

  const updateQuantity: CartContextValue['updateQuantity'] = (productId, quantity, selectedColor, selectedSize) => {
    setItems(prev =>
      prev
        .map(ci => {
          if (ci.id !== productId) return ci
          if (ci.selectedColor !== selectedColor || ci.selectedSize !== selectedSize) return ci
          const q = Math.max(1, quantity || 1)
          return { ...ci, quantity: q, totalPrice: ci.unitPrice * q }
        })
    )
  }

  const removeItem: CartContextValue['removeItem'] = (productId, selectedColor, selectedSize) => {
    setItems(prev => prev.filter(ci => !(ci.id === productId && ci.selectedColor === selectedColor && ci.selectedSize === selectedSize)))
  }

  const clear = () => setItems([])

  const count = useMemo(() => items.reduce((acc, it) => acc + it.quantity, 0), [items])
  const total = useMemo(() => items.reduce((acc, it) => acc + it.totalPrice, 0), [items])

  const value: CartContextValue = { items, count, total, addItem, updateQuantity, removeItem, clear }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
