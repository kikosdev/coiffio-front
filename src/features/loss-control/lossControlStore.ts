import { create } from 'zustand';
import { api, ApiError } from '@/shared/api/client';

/** Tolérance visuelle partagée entre l'écran et le modal d'investigation. */
export function varianceTone(pct: number): 'success' | 'pending' | 'error' {
  const abs = Math.abs(pct);
  if (abs <= 10) return 'success';
  if (abs <= 30) return 'pending';
  return 'error';
}

export type LossAlertKind = 'stock_variance' | 'staff_honesty' | 'extreme_usage';
export type LossAlertSeverity = 'warning' | 'critical';
export type Period = 'day' | 'week' | 'month';

export interface LossAlert {
  _id: string;
  kind: LossAlertKind;
  severity: LossAlertSeverity;
  productId?: string;
  stylistId?: string;
  appointmentId?: string;
  expected: number;
  declared: number;
  actual?: number;
  variancePct: number;
  thresholdPct: number;
  period?: { from: string; to: string };
  read: boolean;
  createdAt: string;
}

export interface VarianceResult {
  productId: string;
  hasBaseline: boolean;
  baselineDate?: string;
  stockTheoretical?: number;
  stockReal?: number;
  variance?: number;
  variancePct?: number;
  breakdown?: { refill: number; loss: number; adjustment: number; sold: number; consumedUnits: number };
}

export interface StaffHonestyRow {
  stylistId: string;
  expected: number;
  declared: number;
  variancePct: number;
  byProduct: { productId: string; expected: number; declared: number; variancePct: number }[];
}

export interface ExtremeUsageRow {
  doseLogId: string;
  appointmentId: string;
  stylistId: string;
  productId: string;
  dosesDeclared: number;
  dosesExpected: number;
  variancePct: number;
  extremeUsageFactor: number;
}

export interface InvestigationDoseRow {
  productId: string;
  productName: string;
  dosesDeclared: number;
  dosesExpected: number;
  variancePct: number;
  lockedAt: string | null;
  correctedBy?: string;
  correctionNote?: string;
}

export interface InvestigationResult {
  appointment: {
    id: string;
    status: string;
    source: string;
    start: string;
    client: { name: string; phone: string };
    stylist: { id: string; name: string };
    services: { id: string; name: string; price: number; durationMin: number }[];
  };
  doses: InvestigationDoseRow[];
  payment: { id: string; amount: number; method: string; commission: number; productCommission: number } | null;
}

interface LossControlStore {
  alerts: LossAlert[];
  alertsLoading: boolean;
  alertsError: string | null;
  fetchAlerts: () => Promise<void>;
  markAlertRead: (id: string) => Promise<void>;

  variance: Record<string, VarianceResult>;
  varianceLoading: boolean;
  varianceError: string | null;
  fetchVariance: (productIds: string[], period: Period) => Promise<void>;

  staffHonesty: StaffHonestyRow[];
  staffHonestyLoading: boolean;
  staffHonestyError: string | null;
  fetchStaffHonesty: (period: Period) => Promise<void>;

  extremeUsage: ExtremeUsageRow[];
  extremeUsageLoading: boolean;
  extremeUsageError: string | null;
  fetchExtremeUsage: (period: Period) => Promise<void>;

  investigation: InvestigationResult | null;
  investigationLoading: boolean;
  investigationError: string | null;
  fetchInvestigation: (appointmentId: string) => Promise<void>;
  clearInvestigation: () => void;
}

export const useLossControlStore = create<LossControlStore>((set) => ({
  alerts: [],
  alertsLoading: false,
  alertsError: null,

  fetchAlerts: async () => {
    set({ alertsLoading: true, alertsError: null });
    try {
      const alerts = await api.get<LossAlert[]>('/loss-control/alerts', { read: 'false' });
      set({ alerts, alertsLoading: false });
    } catch (err) {
      set({ alertsLoading: false, alertsError: err instanceof ApiError ? err.message : 'Erreur' });
    }
  },

  markAlertRead: async (id) => {
    await api.post(`/loss-control/alerts/${id}/read`, {});
    set((s) => ({ alerts: s.alerts.filter((a) => a._id !== id) }));
  },

  variance: {},
  varianceLoading: false,
  varianceError: null,

  fetchVariance: async (productIds, period) => {
    if (productIds.length === 0) { set({ variance: {} }); return; }
    set({ varianceLoading: true, varianceError: null });
    try {
      const results = await Promise.all(
        productIds.map((productId) => api.get<VarianceResult>('/loss-control/variance', { productId, period })),
      );
      const map: Record<string, VarianceResult> = {};
      results.forEach((r) => { map[r.productId] = r; });
      set({ variance: map, varianceLoading: false });
    } catch (err) {
      set({ varianceLoading: false, varianceError: err instanceof ApiError ? err.message : 'Erreur' });
    }
  },

  staffHonesty: [],
  staffHonestyLoading: false,
  staffHonestyError: null,

  fetchStaffHonesty: async (period) => {
    set({ staffHonestyLoading: true, staffHonestyError: null });
    try {
      const result = await api.get<{ byStaff: StaffHonestyRow[] }>('/loss-control/staff-honesty', { period });
      set({ staffHonesty: result.byStaff, staffHonestyLoading: false });
    } catch (err) {
      set({ staffHonestyLoading: false, staffHonestyError: err instanceof ApiError ? err.message : 'Erreur' });
    }
  },

  extremeUsage: [],
  extremeUsageLoading: false,
  extremeUsageError: null,

  fetchExtremeUsage: async (period) => {
    set({ extremeUsageLoading: true, extremeUsageError: null });
    try {
      const extremeUsage = await api.get<ExtremeUsageRow[]>('/loss-control/extreme-usage', { period });
      set({ extremeUsage, extremeUsageLoading: false });
    } catch (err) {
      set({ extremeUsageLoading: false, extremeUsageError: err instanceof ApiError ? err.message : 'Erreur' });
    }
  },

  investigation: null,
  investigationLoading: false,
  investigationError: null,

  fetchInvestigation: async (appointmentId) => {
    set({ investigationLoading: true, investigationError: null, investigation: null });
    try {
      const investigation = await api.get<InvestigationResult>(`/loss-control/appointments/${appointmentId}/investigation`);
      set({ investigation, investigationLoading: false });
    } catch (err) {
      set({ investigationLoading: false, investigationError: err instanceof ApiError ? err.message : 'Erreur' });
    }
  },

  clearInvestigation: () => set({ investigation: null, investigationError: null }),
}));
