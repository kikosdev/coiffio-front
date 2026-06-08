import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const usePublicCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      add(item) {
        set(s => {
          const existing = s.items.find(i => i.productId === item.productId)
          if (existing) {
            return {
              items: s.items.map(i =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
                  : i,
              ),
            }
          }
          return { items: [...s.items, { ...item, quantity: item.quantity ?? 1 }] }
        })
      },

      updateQuantity(productId, quantity) {
        if (quantity < 1) {
          set(s => ({ items: s.items.filter(i => i.productId !== productId) }))
        } else {
          set(s => ({
            items: s.items.map(i => i.productId === productId ? { ...i, quantity } : i),
          }))
        }
      },

      remove(productId) {
        set(s => ({ items: s.items.filter(i => i.productId !== productId) }))
      },

      clear() {
        set({ items: [] })
      },

      get subtotal() {
        return get().items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
      },

      get count() {
        return get().items.reduce((s, i) => s + i.quantity, 0)
      },
    }),
    {
      name: 'coiffio-cart',
    },
  ),
)
