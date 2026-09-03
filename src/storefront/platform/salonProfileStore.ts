import { create } from 'zustand';
import api, { ApiError } from '@/shared/api/client';

export interface SalonProfileLocation {
  name: string;
  address: { line1?: string; city?: string; postalCode?: string; country?: string };
  phone: string;
  openingHours: unknown[];
  region?: string;
}
export interface SalonProfileService {
  name: string;
  category: string;
  price: number;
  durationMin: number;
}
export interface SalonProfileTestimonial {
  quote: string;
  authorFirstName: string;
  createdAt: string;
}
export interface SalonProfileTeamMember {
  name: string;
  role: string;
  avatar: null;
}
export interface SalonProfile {
  slug: string;
  name: string;
  locations: SalonProfileLocation[];
  services: SalonProfileService[];
  testimonials: SalonProfileTestimonial[];
  team: SalonProfileTeamMember[];
}

interface SalonProfileStore {
  slug: string | null;
  profile: SalonProfile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (slug: string) => Promise<void>;
  reset: () => void;
}

/** Fiche salon (`/discovery/salon/:slug`) — consommée par SalonPage et par l'étape I du booking (pré-remplissage `?salon=`). */
export const useSalonProfileStore = create<SalonProfileStore>((set) => ({
  slug: null,
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async (slug) => {
    set({ loading: true, error: null, slug });
    try {
      const profile = await api.get<SalonProfile>(`/discovery/salon/${slug}`);
      set({ profile, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof ApiError ? err.message : 'Erreur de chargement' });
    }
  },

  reset: () => set({ slug: null, profile: null, loading: false, error: null }),
}));
