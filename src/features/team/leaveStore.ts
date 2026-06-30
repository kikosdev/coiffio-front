import { create } from 'zustand';
import { api, ApiError } from '@/shared/api/client';

export type LeaveType = 'leave' | 'swap';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveConflict {
  appointmentId: string;
  start: string;
  end: string;
  clientId: string;
}

export interface LeaveRange {
  from: string; // YYYY-MM-DD
  to: string;
}

export interface LeaveRequest {
  _id: string;
  stylistId: string;
  swapWithId?: string;
  type: LeaveType;
  range: LeaveRange;
  note: string;
  status: LeaveStatus;
  conflicts: LeaveConflict[];
}

export interface CreateLeaveDto {
  stylistId?: string;
  type: LeaveType;
  range: LeaveRange;
  swapWithId?: string;
  note?: string;
}

/** Résultat d'une tentative d'approbation : succès, ou blocage #6 (409) avec conflits. */
export interface ApproveOutcome {
  blocked: boolean;
  request?: LeaveRequest;
  conflicts: LeaveConflict[];
}

interface LeaveStore {
  items: LeaveRequest[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  create: (dto: CreateLeaveDto) => Promise<void>;
  /** Approuve : renvoie blocked+conflits si des bookings collisionnent (#6, 409). */
  approve: (id: string) => Promise<ApproveOutcome>;
  reject: (id: string) => Promise<void>;
}

export const useLeaveStore = create<LeaveStore>((set) => ({
  items: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const items = await api.get<LeaveRequest[]>('/leave-requests');
      set({ items, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof ApiError ? err.message : 'Erreur de chargement' });
    }
  },

  create: async (dto) => {
    const saved = await api.post<LeaveRequest>('/leave-requests', dto);
    set((s) => ({ items: [saved, ...s.items] }));
  },

  approve: async (id) => {
    try {
      const request = await api.post<LeaveRequest>(`/leave-requests/${id}/approve`, {});
      set((s) => ({ items: s.items.map((r) => (r._id === id ? request : r)) }));
      return { blocked: false, request, conflicts: [] };
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        // BLOCAGE #6 : la liste des conflits voyage dans details.conflicts.
        const conflicts = (err.details?.conflicts as LeaveConflict[] | undefined) ?? [];
        set((s) => ({
          items: s.items.map((r) => (r._id === id ? { ...r, conflicts } : r)),
        }));
        return { blocked: true, conflicts };
      }
      throw err;
    }
  },

  reject: async (id) => {
    const saved = await api.post<LeaveRequest>(`/leave-requests/${id}/reject`, {});
    set((s) => ({ items: s.items.map((r) => (r._id === id ? saved : r)) }));
  },
}));
