import { create } from 'zustand';
import { api, ApiError } from '@/shared/api/client';

// NB : l'api client utilise axios `withCredentials:true` (équivalent fetch credentials:'include'),
// donc le cookie httpOnly cartToken voyage automatiquement. Indispensable au panier invité.

export interface ShopProduct {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}
export interface CartLine { productId: string; qty: number; unitPrice: number; }
export interface Cart { items: CartLine[]; }

export interface CheckoutDto { name: string; phone: string; email: string; pickupAt?: string; delivery?: boolean; }
export interface Order {
  _id: string;
  items: { productId: string; name: string; qty: number; unitPrice: number }[];
  total: number;
  status: string;
  trackToken: string;
  pickupAt?: string;
  date: string;
}

interface CartStore {
  products: ShopProduct[];
  cart: Cart;
  drawerOpen: boolean;
  loading: boolean;
  error: string | null;

  fetchProducts: () => Promise<void>;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, qty?: number) => Promise<void>;
  updateQty: (productId: string, qty: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  checkout: (dto: CheckoutDto) => Promise<Order>;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  products: [],
  cart: { items: [] },
  drawerOpen: false,
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await api.get<ShopProduct[]>('/shop/products');
      set({ products, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof ApiError ? err.message : 'Erreur' });
    }
  },

  fetchCart: async () => {
    const cart = await api.get<Cart>('/cart');
    set({ cart: cart ?? { items: [] } });
  },

  addItem: async (productId, qty = 1) => {
    const cart = await api.post<Cart>('/cart/items', { productId, qty });
    set({ cart, drawerOpen: true });
  },

  updateQty: async (productId, qty) => {
    if (qty < 1) {
      const cart = await api.delete<Cart>(`/cart/items/${productId}`);
      set({ cart });
    } else {
      const cart = await api.patch<Cart>(`/cart/items/${productId}`, { qty });
      set({ cart });
    }
  },

  removeItem: async (productId) => {
    const cart = await api.delete<Cart>(`/cart/items/${productId}`);
    set({ cart });
  },

  checkout: async (dto) => {
    const order = await api.post<Order>('/orders', dto);
    set({ cart: { items: [] } });
    void get().fetchProducts();
    return order;
  },

  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
}));
