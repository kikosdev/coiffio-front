import { create } from 'zustand';
import { api, ApiError } from '@/shared/api/client';

export interface BusinessHour {
  day: number;
  isOpen: boolean;
  start: string;
  end: string;
}

export interface SalonConfig {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  timezone: string;
  currency: string;
  taxRate: number;
  businessHours: BusinessHour[];
}

export interface SalonRole {
  _id: string;
  name: string;
  isSystem: boolean;
  permissions: string[];
  color: string;
}

export type Permission = string;

interface SettingsStore {
  salon: SalonConfig | null;
  roles: SalonRole[];
  permissions: Permission[];
  loading: boolean;
  saving: boolean;
  error: string | null;

  fetchSalon: () => Promise<void>;
  updateSalon: (data: Partial<SalonConfig>) => Promise<void>;
  fetchRoles: () => Promise<void>;
  fetchPermissions: () => Promise<void>;
  createRole: (data: { name: string; permissions: string[]; color?: string }) => Promise<void>;
  updateRole: (id: string, data: { name?: string; permissions?: string[]; color?: string }) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  salon: null,
  roles: [],
  permissions: [],
  loading: false,
  saving: false,
  error: null,

  fetchSalon: async () => {
    set({ loading: true, error: null });
    try {
      const salon = await api.get<SalonConfig>('/settings/salon');
      set({ salon, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof ApiError ? err.message : 'Erreur' });
    }
  },

  updateSalon: async (data) => {
    set({ saving: true, error: null });
    try {
      const salon = await api.patch<SalonConfig>('/settings/salon', data);
      set({ salon, saving: false });
    } catch (err) {
      set({ saving: false, error: err instanceof ApiError ? err.message : 'Erreur' });
      throw err;
    }
  },

  fetchRoles: async () => {
    try {
      const roles = await api.get<SalonRole[]>('/settings/roles');
      set({ roles });
    } catch {
      // silent
    }
  },

  fetchPermissions: async () => {
    try {
      const permissions = await api.get<Permission[]>('/settings/permissions');
      set({ permissions });
    } catch {
      // silent
    }
  },

  createRole: async (data) => {
    const role = await api.post<SalonRole>('/settings/roles', data);
    set((s) => ({ roles: [...s.roles, role] }));
  },

  updateRole: async (id, data) => {
    const role = await api.patch<SalonRole>(`/settings/roles/${id}`, data);
    set((s) => ({ roles: s.roles.map((r) => (r._id === id ? role : r)) }));
  },

  deleteRole: async (id) => {
    await api.delete(`/settings/roles/${id}`);
    set((s) => ({ roles: s.roles.filter((r) => r._id !== id) }));
  },
}));
