import { create } from 'zustand';
import { api, ApiError } from '@/shared/api/client';
import { localDateISO } from '@/shared/date';

export interface OverviewData {
  arc: { hour: number; count: number }[];
  kpis: {
    revenue: number;
    appointments: { booked: number; done: number; noShow: number };
    walkins: number;
    occupancyPct: number;
    tips: number;
  };
  alerts: {
    lowStock: { productId: string; name: string; stock: number; lowStockAt: number }[];
    pendingOrders: number;
    leaveRequests: number;
  };
  topStylists: { stylistId: string; name: string; revenue: number; bookings: number }[];
  todayAppointments: {
    id: string;
    start: string;
    end: string;
    clientName: string;
    serviceName: string;
    stylistName: string;
    status: string;
    source: string;
  }[];
  revenueByMethod: { cash: number; card: number; mobile: number };
}

interface OverviewStore {
  data: OverviewData | null;
  date: string;
  loading: boolean;
  error: string | null;
  setDate: (d: string) => void;
  fetch: (date?: string) => Promise<void>;
}

export const useOverviewStore = create<OverviewStore>((set, get) => ({
  data: null,
  date: localDateISO(),
  loading: false,
  error: null,
  setDate: (date) => set({ date }),
  fetch: async (date) => {
    const d = date ?? get().date;
    set({ loading: true, error: null });
    try {
      const data = await api.get<OverviewData>('/overview', { date: d });
      set({ data, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof ApiError ? err.message : 'Erreur' });
    }
  },
}));
