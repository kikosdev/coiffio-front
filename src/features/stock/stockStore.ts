import { create } from 'zustand';
import { api, ApiError } from '@/shared/api/client';

export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  lowStockAt: number;
  supplier: string;
  barcode: string;
  notes: string;
  visibleLanding: boolean;
  promo: boolean;
  promoPercent: number;
  promoLabel: string;
  active: boolean;
}

export interface StockMove {
  _id: string;
  productId: string;
  type: 'in' | 'out';
  qty: number;
  date: string;
  note: string;
}

export interface ProductDto {
  name: string;
  category?: string;
  price: number;
  cost?: number;
  stock?: number;
  lowStockAt?: number;
  supplier?: string;
  barcode?: string;
  notes?: string;
}

interface StockStore {
  items: Product[];
  movements: StockMove[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  create: (dto: ProductDto) => Promise<Product>;
  update: (id: string, dto: Partial<ProductDto> & { active?: boolean; visibleLanding?: boolean; promo?: boolean; promoPercent?: number; promoLabel?: string }) => Promise<void>;
  remove: (id: string) => Promise<void>;
  restock: (id: string, qty: number, note?: string) => Promise<void>;
  adjustStock: (id: string, delta: number) => Promise<void>;
  fetchMovements: (productId?: string) => Promise<void>;
}

export const useStockStore = create<StockStore>((set) => ({
  items: [],
  movements: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const items = await api.get<Product[]>('/products', { activeOnly: 'false' });
      set({ items, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof ApiError ? err.message : 'Erreur' });
    }
  },

  create: async (dto) => {
    const saved = await api.post<Product>('/products', dto);
    set((s) => ({ items: [...s.items, saved] }));
    return saved;
  },

  update: async (id, dto) => {
    const saved = await api.patch<Product>(`/products/${id}`, dto);
    set((s) => ({ items: s.items.map((p) => (p._id === id ? saved : p)) }));
  },

  remove: async (id) => {
    const saved = await api.delete<Product>(`/products/${id}`);
    set((s) => ({ items: s.items.map((p) => (p._id === id ? saved : p)) }));
  },

  restock: async (id, qty, note) => {
    const saved = await api.post<Product>(`/products/${id}/restock`, { qty, note });
    set((s) => ({ items: s.items.map((p) => (p._id === id ? saved : p)) }));
  },

  adjustStock: async (id, delta) => {
    const saved = await api.post<Product>(`/products/${id}/adjust`, { delta });
    set((s) => ({ items: s.items.map((p) => (p._id === id ? saved : p)) }));
  },

  fetchMovements: async (productId) => {
    const movements = await api.get<StockMove[]>('/stock/movements', productId ? { productId } : undefined);
    set({ movements });
  },
}));
