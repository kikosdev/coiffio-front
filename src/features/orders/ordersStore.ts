import { create } from 'zustand';
import { api, ApiError } from '@/shared/api/client';

export type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'picked_up' | 'cancelled';
export interface Order {
  _id: string;
  clientId?: string;
  items: { productId: string; name: string; qty: number; unitPrice: number }[];
  total: number;
  status: OrderStatus;
  pickupAt?: string;
  trackToken: string;
  date: string;
}

interface OrdersStore {
  items: Order[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  setStatus: (id: string, status: OrderStatus) => Promise<void>;
}

export const useOrdersStore = create<OrdersStore>((set) => ({
  items: [],
  loading: false,
  error: null,
  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const items = await api.get<Order[]>('/orders');
      set({ items, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof ApiError ? err.message : 'Erreur' });
    }
  },
  setStatus: async (id, status) => {
    const saved = await api.patch<Order>(`/orders/${id}/status`, { status });
    set((s) => ({ items: s.items.map((o) => (o._id === id ? saved : o)) }));
  },
}));
