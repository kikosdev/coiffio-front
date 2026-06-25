import { create } from 'zustand';
import { api, ApiError } from '@/shared/api/client';

export type Method = 'cash' | 'card';
export type LineKind = 'service' | 'product';
export type Period = 'day' | 'week' | 'month';

export interface PaymentLine { kind: LineKind; refId: string; name: string; qty: number; unitPrice: number; }
export interface Payment {
  _id: string;
  stylistId: string;
  items: PaymentLine[];
  amount: number;
  tip: number;
  commission: number;
  method: Method;
  date: string;
  refunded: boolean;
}
export interface CaisseTotals {
  count: number; gross: number; tips: number; commission: number;
  byMethod: { cash: number; card: number };
}
export interface ByStylist { stylistId: string; name: string; gross: number; tips: number; commission: number; }
export interface Expense { _id: string; category: string; amount: number; date: string; note: string; }
export interface Report { period: Period; revenue: number; tips: number; expenses: number; net: number; salesCount: number; }

export interface CreatePaymentDto {
  appointmentId?: string;
  stylistId: string;
  items: PaymentLine[];
  tip?: number;
  method: Method;
}

interface FinanceStore {
  myPayments: Payment[];
  myTotals: CaisseTotals | null;
  overviewTotals: CaisseTotals | null;
  byStylist: ByStylist[];
  overviewPayments: Payment[];
  expenses: Expense[];
  report: Report | null;
  loading: boolean;
  error: string | null;

  fetchMyCaisse: () => Promise<void>;
  fetchOverview: () => Promise<void>;
  pay: (dto: CreatePaymentDto) => Promise<Payment>;
  refund: (id: string) => Promise<void>;
  fetchExpenses: () => Promise<void>;
  createExpense: (dto: { category: string; amount: number; date?: string; note?: string }) => Promise<void>;
  updateExpense: (id: string, dto: Partial<{ category: string; amount: number; date: string; note: string }>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  fetchReport: (period: Period) => Promise<void>;
  exportCsv: (period: Period) => Promise<void>;
}

export const useFinanceStore = create<FinanceStore>((set) => ({
  myPayments: [],
  myTotals: null,
  overviewTotals: null,
  byStylist: [],
  overviewPayments: [],
  expenses: [],
  report: null,
  loading: false,
  error: null,

  fetchMyCaisse: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<{ payments: Payment[]; totals: CaisseTotals }>('/caisse/me');
      set({ myPayments: data.payments, myTotals: data.totals, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof ApiError ? err.message : 'Erreur' });
    }
  },

  fetchOverview: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<{ totals: CaisseTotals; byStylist: ByStylist[]; payments: Payment[] }>('/caisse/overview');
      set({ overviewTotals: data.totals, byStylist: data.byStylist, overviewPayments: data.payments, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof ApiError ? err.message : 'Erreur' });
    }
  },

  pay: async (dto) => {
    const saved = await api.post<Payment>('/payments', dto);
    set((s) => ({ myPayments: [saved, ...s.myPayments] }));
    return saved;
  },

  refund: async (id) => {
    const saved = await api.post<Payment>(`/payments/${id}/refund`, {});
    set((s) => ({
      myPayments: s.myPayments.map((p) => (p._id === id ? saved : p)),
      overviewPayments: s.overviewPayments.map((p) => (p._id === id ? saved : p)),
    }));
  },

  fetchExpenses: async () => {
    const expenses = await api.get<Expense[]>('/expenses');
    set({ expenses });
  },

  createExpense: async (dto) => {
    const saved = await api.post<Expense>('/expenses', dto);
    set((s) => ({ expenses: [saved, ...s.expenses] }));
  },

  updateExpense: async (id, dto) => {
    const saved = await api.patch<Expense>(`/expenses/${id}`, dto);
    set((s) => ({ expenses: s.expenses.map((e) => (e._id === id ? saved : e)) }));
  },

  deleteExpense: async (id) => {
    await api.delete(`/expenses/${id}`);
    set((s) => ({ expenses: s.expenses.filter((e) => e._id !== id) }));
  },

  fetchReport: async (period) => {
    const report = await api.get<Report>('/reports', { period });
    set({ report });
  },

  exportCsv: async (period) => {
    const res = await api.raw.get('/reports/export.csv', { params: { period }, responseType: 'blob' });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
}));
