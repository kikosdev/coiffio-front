import { create } from 'zustand';
import { api, ApiError } from '@/shared/api/client';
import type { CrudStore } from '@/shared/store/crud';

export type ServiceGender = 'men' | 'women' | 'universal';

export interface DoseConfigEntry {
  productId: string;
  doses: number;
}

export interface Service {
  _id: string;
  salonId: string;
  name: string;
  category: string;
  gender: ServiceGender;
  price: number;
  durationMin: number;
  bufferMin: number;
  color: string;
  active: boolean;
  doseConfig?: DoseConfigEntry[];
}

export interface ServiceDto {
  name: string;
  category?: string;
  gender: ServiceGender;
  price: number;
  durationMin: number;
  bufferMin?: number;
  color?: string;
}

interface ServiceStore extends CrudStore<Service, ServiceDto, Partial<ServiceDto>> {
  updateDoseConfig: (id: string, doseConfig: DoseConfigEntry[]) => Promise<void>;
}

/** CrudStore services (Sprint 2) — soft delete via remove() (active:false côté API). */
export const useServiceStore = create<ServiceStore>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetch: async (params) => {
    set({ loading: true, error: null });
    try {
      const items = await api.get<Service[]>('/services', params);
      set({ items, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof ApiError ? err.message : 'Erreur de chargement' });
    }
  },

  create: async (dto) => {
    const saved = await api.post<Service>('/services', dto);
    set((s) => ({ items: [...s.items, saved] }));
    return saved;
  },

  update: async (id, dto) => {
    const prev = get().items;
    set({ items: prev.map((s) => (s._id === id ? { ...s, ...dto } as Service : s)) });
    try {
      const saved = await api.patch<Service>(`/services/${id}`, dto);
      set((s) => ({ items: s.items.map((x) => (x._id === id ? saved : x)) }));
      return saved;
    } catch (err) {
      set({ items: prev });
      throw err;
    }
  },

  remove: async (id) => {
    // Soft delete : DELETE renvoie le doc archivé (active:false) → on le retire de la liste active.
    const prev = get().items;
    set({ items: prev.filter((s) => s._id !== id) });
    try {
      await api.delete<Service>(`/services/${id}`);
    } catch (err) {
      set({ items: prev });
      throw err;
    }
  },

  // Endpoint séparé de update() — owner-only côté backend (LC-2/LC-T8).
  updateDoseConfig: async (id, doseConfig) => {
    const saved = await api.patch<Service>(`/services/${id}/dose-config`, { doseConfig });
    set((s) => ({ items: s.items.map((x) => (x._id === id ? saved : x)) }));
  },
}));
