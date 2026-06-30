import { create } from 'zustand';
import { api, ApiError } from '@/shared/api/client';

export interface SalonBusinessHour {
  day: number;
  isOpen: boolean;
  start: string;
  end: string;
}

export type StaffRole = 'owner' | 'manager' | 'stylist' | 'colorist';
export type StaffLevel = 'master' | 'senior' | 'apprentice';

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  color: string;
  isActive: boolean;
  // StaffProfile (présent pour les stylists). Paie jointe uniquement pour owner/manager (#9).
  level?: StaffLevel;
  capabilities?: string[];
  baseRate?: number;
  commissionPct?: number;
}

export interface TimeBreak {
  start: string;
  end: string;
}
export interface WeeklyShift {
  day: number;
  start: string;
  end: string;
  breaks: TimeBreak[];
}
export interface ScheduleOverride {
  date: string;
  type: 'off' | 'leave' | 'custom';
  start?: string;
  end?: string;
  note?: string;
}
export interface Schedule {
  _id: string;
  stylistId: string;
  weekly: WeeklyShift[];
  overrides: ScheduleOverride[];
}

/** Chiffres propres du stylist courant (#9) — /team/me/standing. */
export interface StylistStanding {
  stylistId: string;
  name: string;
  level: StaffLevel;
  baseRate: number;
  commissionPct: number;
  upcomingShifts: { date: string; start: string; end: string }[];
  completedCount: number;
  upcomingCount: number;
  grossServices: number;
  estimatedCommission: number;
  tips: number;
}

export interface CreateStaffDto {
  name: string;
  email: string;
  phone: string;
  role: 'manager' | 'stylist' | 'colorist';
  password: string;
  color?: string;
  level?: StaffLevel;
  capabilities?: string[];
  baseRate?: number;
  commissionPct?: number;
}
export interface UpdateStaffDto {
  name?: string;
  phone?: string;
  role?: 'manager' | 'stylist' | 'colorist';
  isActive?: boolean;
  color?: string;
  level?: StaffLevel;
  capabilities?: string[];
  baseRate?: number;
  commissionPct?: number;
}

interface TeamStore {
  staff: Staff[];
  loading: boolean;
  error: string | null;
  schedule: Schedule | null;
  scheduleLoading: boolean;
  standing: StylistStanding | null;
  standingLoading: boolean;
  salonHours: SalonBusinessHour[];

  fetchStaff: () => Promise<void>;
  createStaff: (dto: CreateStaffDto) => Promise<Staff>;
  updateStaff: (id: string, dto: UpdateStaffDto) => Promise<void>;
  deactivateStaff: (id: string) => Promise<void>;

  fetchSchedule: (stylistId: string) => Promise<void>;
  saveWeekly: (stylistId: string, weekly: WeeklyShift[]) => Promise<void>;
  addOverride: (stylistId: string, ov: ScheduleOverride) => Promise<void>;
  removeOverride: (stylistId: string, date: string) => Promise<void>;

  fetchStanding: () => Promise<void>;
  fetchSalonHours: () => Promise<void>;
}

export const useTeamStore = create<TeamStore>((set) => ({
  staff: [],
  loading: false,
  error: null,
  schedule: null,
  scheduleLoading: false,
  standing: null,
  standingLoading: false,
  salonHours: [],

  fetchStaff: async () => {
    set({ loading: true, error: null });
    try {
      const staff = await api.get<Staff[]>('/team');
      set({ staff, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof ApiError ? err.message : 'Erreur de chargement' });
    }
  },

  createStaff: async (dto) => {
    const saved = await api.post<Staff>('/team', dto);
    set((s) => ({ staff: [...s.staff, saved] }));
    return saved;
  },

  updateStaff: async (id, dto) => {
    const saved = await api.patch<Staff>(`/team/${id}`, dto);
    set((s) => ({ staff: s.staff.map((m) => (m.id === id ? saved : m)) }));
  },

  deactivateStaff: async (id) => {
    const saved = await api.delete<Staff>(`/team/${id}`);
    set((s) => ({ staff: s.staff.map((m) => (m.id === id ? saved : m)) }));
  },

  // Schedule = source de vérité de disponibilité → endpoints /schedule/:stylistId.
  fetchSchedule: async (stylistId) => {
    set({ scheduleLoading: true });
    try {
      const schedule = await api.get<Schedule>(`/schedule/${stylistId}`);
      set({ schedule, scheduleLoading: false });
    } catch (err) {
      set({ scheduleLoading: false, error: err instanceof ApiError ? err.message : 'Erreur de chargement' });
    }
  },

  saveWeekly: async (stylistId, weekly) => {
    const schedule = await api.put<Schedule>(`/schedule/${stylistId}`, { weekly });
    set({ schedule });
  },

  addOverride: async (stylistId, ov) => {
    const schedule = await api.post<Schedule>(`/schedule/${stylistId}/override`, ov);
    set({ schedule });
  },

  removeOverride: async (stylistId, date) => {
    const schedule = await api.delete<Schedule>(`/schedule/${stylistId}/override/${encodeURIComponent(date)}`);
    set({ schedule });
  },

  fetchStanding: async () => {
    set({ standingLoading: true });
    try {
      const standing = await api.get<StylistStanding>('/team/me/standing');
      set({ standing, standingLoading: false });
    } catch (err) {
      set({ standingLoading: false, error: err instanceof ApiError ? err.message : 'Erreur de chargement' });
    }
  },

  fetchSalonHours: async () => {
    try {
      const salonHours = await api.get<SalonBusinessHour[]>('/schedule/salon-hours');
      set({ salonHours });
    } catch {
      // Non-bloquant — la rota reste éditable sans restriction si la requête échoue.
    }
  },
}));
