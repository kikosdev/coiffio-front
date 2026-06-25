import { create } from 'zustand';
import { api, ApiError } from '@/shared/api/client';
import type { CrudStore } from '@/shared/store/crud';

export type PreferredChannel = 'email' | 'sms';

export interface ClientHistoryEntry {
  type: 'appointment' | 'order';
  refId: string;
  date: string;
  summary: string;
}

export interface Client {
  _id: string;
  salonId: string;
  name: string;
  phone: string;
  email: string;
  commsConsent: boolean;
  preferredChannel: PreferredChannel;
  registered: boolean;
  notes: string;
  history: ClientHistoryEntry[];
  createdAt?: string;
}

export interface ClientDto {
  name: string;
  phone: string;
  email?: string;
  commsConsent?: boolean;
  preferredChannel?: PreferredChannel;
  notes?: string;
}

interface ClientStore extends CrudStore<Client, ClientDto, Partial<ClientDto>> {
  query: string;
  setQuery: (q: string) => void;
}

/**
 * Implémentation de référence du pattern CrudStore (Sprint 2).
 * Le scope salon est appliqué côté backend (getSalonScope) ; l'api client déballe
 * déjà l'enveloppe. Optimistic UI sur update ; create réconcilie via merge-on-phone.
 */
export const useClientStore = create<ClientStore>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  query: '',

  setQuery: (q) => set({ query: q }),

  fetch: async (params) => {
    set({ loading: true, error: null });
    try {
      const q = get().query;
      const items = await api.get<Client[]>('/clients', { ...(q ? { q } : {}), ...params });
      set({ items, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof ApiError ? err.message : 'Erreur de chargement' });
    }
  },

  create: async (dto) => {
    const saved = await api.post<Client>('/clients', dto);
    // merge-on-phone : remplace si déjà présent (même _id), sinon ajoute en tête.
    set((s) => {
      const exists = s.items.some((c) => c._id === saved._id);
      return { items: exists ? s.items.map((c) => (c._id === saved._id ? saved : c)) : [saved, ...s.items] };
    });
    return saved;
  },

  update: async (id, dto) => {
    // Optimistic : applique localement avant la réponse serveur.
    const prev = get().items;
    set({ items: prev.map((c) => (c._id === id ? { ...c, ...dto } as Client : c)) });
    try {
      const saved = await api.patch<Client>(`/clients/${id}`, dto);
      set((s) => ({ items: s.items.map((c) => (c._id === id ? saved : c)) }));
      return saved;
    } catch (err) {
      set({ items: prev }); // rollback
      throw err;
    }
  },

  remove: async (id) => {
    // Clients : pas de suppression en V1 (CRM conservé). Garde l'interface complète.
    set((s) => ({ items: s.items.filter((c) => c._id !== id) }));
  },
}));
