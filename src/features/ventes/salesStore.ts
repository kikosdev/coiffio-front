import { create } from 'zustand';
import { api, ApiError } from '@/shared/api/client';
import { useAuthStore } from '@/shared/store/authStore';
import type { Product } from '@/features/stock/stockStore';

export interface SaleLine {
  refId: string;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface SaleDiscount {
  type: 'amount' | 'pct';
  value: number;
  computed: number;
}

export interface Sale {
  _id: string;
  salonId: string;
  source: 'pos' | 'order';
  items: SaleLine[];
  subtotal: number;
  discount?: SaleDiscount;
  total: number;
  method?: 'cash' | 'card';
  stylistId?: string;
  date: string;
  voided?: boolean;
  voidedBy?: string;
  voidedAt?: string;
  stockRestored?: boolean;
}

export interface BestSeller {
  refId: string;
  name: string;
  qty: number;
  revenue: number;
}

export interface SaleDraftItem {
  refId: string;
  name: string;
  unitPrice: number;
  qty: number;
  stock: number;
}

interface SalesStore {
  // historique
  sales: Sale[];
  bestSellers: BestSeller[];
  period: 'day' | 'week' | 'month';
  isLoading: boolean;
  error: string | null;

  // panier POS (draft — jamais persisté)
  draft: SaleDraftItem[];
  discount: { type: 'amount' | 'pct'; value: number } | null;
  method: 'cash' | 'card';

  // historique
  fetchSales: () => Promise<void>;
  fetchBestSellers: () => Promise<void>;
  setPeriod: (p: 'day' | 'week' | 'month') => void;
  voidSale: (id: string, restock: boolean) => Promise<void>;

  // panier
  addItem: (product: Product) => void;
  setQty: (refId: string, qty: number) => void;
  removeItem: (refId: string) => void;
  setDiscount: (d: { type: 'amount' | 'pct'; value: number } | null) => void;
  setMethod: (m: 'cash' | 'card') => void;
  subtotal: () => number;
  total: () => number;
  submit: () => Promise<Sale>;
  resetDraft: () => void;
}

export const useSalesStore = create<SalesStore>((set, get) => ({
  sales: [],
  bestSellers: [],
  period: 'day',
  isLoading: false,
  error: null,

  draft: [],
  discount: null,
  method: 'cash',

  // ─── Historique ────────────────────────────────────────────────────────

  fetchSales: async () => {
    set({ isLoading: true, error: null });
    try {
      const role = useAuthStore.getState().user?.role;
      const period = get().period;
      const url = role === 'stylist' ? '/sales/me' : '/sales';
      const sales = await api.get<Sale[]>(url, { period });
      set({ sales, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof ApiError ? err.message : 'Erreur' });
    }
  },

  fetchBestSellers: async () => {
    try {
      const period = get().period;
      const bestSellers = await api.get<BestSeller[]>('/sales/best-sellers', { period, limit: 5 });
      set({ bestSellers });
    } catch {
      // non-bloquant
    }
  },

  setPeriod: (p) => {
    set({ period: p });
  },

  voidSale: async (id, restock) => {
    await api.delete<Sale>(`/sales/${id}?restock=${restock}`);
    set((s) => ({ sales: s.sales.filter((sale) => sale._id !== id) }));
  },

  // ─── Panier ────────────────────────────────────────────────────────────

  addItem: (product) => {
    set((s) => {
      const existing = s.draft.find((i) => i.refId === product._id);
      if (existing) {
        if (existing.qty >= product.stock) return s; // refus > stock
        return {
          draft: s.draft.map((i) =>
            i.refId === product._id ? { ...i, qty: i.qty + 1 } : i,
          ),
        };
      }
      if (product.stock <= 0) return s; // stock épuisé
      return {
        draft: [
          ...s.draft,
          {
            refId: product._id,
            name: product.name,
            unitPrice: product.price,
            qty: 1,
            stock: product.stock,
          },
        ],
      };
    });
  },

  setQty: (refId, qty) => {
    set((s) => ({
      draft: s.draft
        .map((i) => {
          if (i.refId !== refId) return i;
          const clamped = Math.max(0, Math.min(qty, i.stock));
          return { ...i, qty: clamped };
        })
        .filter((i) => i.qty > 0),
    }));
  },

  removeItem: (refId) => {
    set((s) => ({ draft: s.draft.filter((i) => i.refId !== refId) }));
  },

  setDiscount: (d) => set({ discount: d }),
  setMethod: (m) => set({ method: m }),

  subtotal: () => get().draft.reduce((a, i) => a + i.qty * i.unitPrice, 0),

  total: () => {
    const sub = get().subtotal();
    const disc = get().discount;
    if (!disc || disc.value <= 0) return sub;
    const computed = disc.type === 'pct' ? (sub * disc.value) / 100 : disc.value;
    return Math.max(0, sub - computed);
  },

  submit: async () => {
    const { draft, discount, method } = get();
    const sale = await api.post<Sale>('/sales', {
      items: draft.map((i) => ({ refId: i.refId, qty: i.qty })),
      discount: discount && discount.value > 0 ? discount : undefined,
      method,
    });
    get().resetDraft();
    await get().fetchSales();
    return sale;
  },

  resetDraft: () => set({ draft: [], discount: null, method: 'cash' }),
}));
