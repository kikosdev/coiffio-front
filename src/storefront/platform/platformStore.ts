import { create } from 'zustand';
import api, { ApiError } from '@/shared/api/client';

export interface PriceRange {
  min: number;
  max: number;
}

/** Carte annuaire normalisée — source réelle variable selon qu'une région est choisie (cf.
 * platformStore.fetchDirectory). `/public/salons` (pas de région choisie) ne porte ni
 * priceRange ni serviceTags — ces champs restent `null`/`[]` pour ces entrées-là, et les
 * cards les masquent proprement plutôt que d'inventer une valeur. `/discovery/by-region`
 * (région choisie) les porte réellement (Prompt 3). */
export interface DirectoryEntry {
  slug: string;
  name: string;
  city: string;
  region: string | null;
  phone: string;
  isOpen: boolean | null;
  coverImage: string | null;
  priceRange: PriceRange | null;
  serviceTags: string[];
}

export interface SponsoredEntry {
  slug: string;
  name: string;
  city: string | null;
  coverImage: string | null;
  priceRange: PriceRange | null;
  serviceTags: string[];
}

interface PublicSalonSummary {
  id: string;
  slug: string;
  name: string;
  address: string;
  coverImage: string | null;
  rating: number | null;
  isOpen: boolean | null;
}

interface DiscoveryLocationHit {
  salonSlug: string;
  salonName: string;
  locationName: string;
  address: { line1?: string; city?: string; postalCode?: string; country?: string };
  phone: string;
  region?: string;
  coverImage: string | null;
  priceRange: PriceRange | null;
  serviceTags: string[];
}

function fromSummary(s: PublicSalonSummary): DirectoryEntry {
  return { slug: s.slug, name: s.name, city: s.address, region: null, phone: '', isOpen: s.isOpen, coverImage: s.coverImage, priceRange: null, serviceTags: [] };
}

function fromLocationHit(h: DiscoveryLocationHit): DirectoryEntry {
  return {
    slug: h.salonSlug,
    name: h.salonName,
    city: h.address?.city ?? '',
    region: h.region ?? null,
    phone: h.phone,
    isOpen: null,
    coverImage: h.coverImage ?? null,
    priceRange: h.priceRange ?? null,
    serviceTags: h.serviceTags ?? [],
  };
}

interface PlatformStore {
  regions: string[];
  regionsLoading: boolean;
  regionsError: string | null;
  fetchRegions: () => Promise<void>;

  directory: DirectoryEntry[];
  directoryLoading: boolean;
  directoryError: string | null;
  directoryRegion: string | null;
  fetchDirectory: (region?: string) => Promise<void>;

  sponsored: SponsoredEntry[];
  sponsoredLoading: boolean;
  sponsoredError: string | null;
  fetchSponsored: (limit?: number) => Promise<void>;
}

export const usePlatformStore = create<PlatformStore>((set) => ({
  regions: [],
  regionsLoading: false,
  regionsError: null,
  fetchRegions: async () => {
    set({ regionsLoading: true, regionsError: null });
    try {
      const regions = await api.get<string[]>('/discovery/regions');
      set({ regions, regionsLoading: false });
    } catch (err) {
      set({ regionsLoading: false, regionsError: err instanceof ApiError ? err.message : 'Erreur de chargement' });
    }
  },

  directory: [],
  directoryLoading: false,
  directoryError: null,
  directoryRegion: null,
  fetchDirectory: async (region) => {
    set({ directoryLoading: true, directoryError: null, directoryRegion: region ?? null });
    try {
      let entries: DirectoryEntry[];
      if (region) {
        const hits = await api.get<DiscoveryLocationHit[]>('/discovery/by-region', { region, limit: 50 });
        const bySlug = new Map<string, DirectoryEntry>();
        for (const h of hits) {
          if (!bySlug.has(h.salonSlug)) bySlug.set(h.salonSlug, fromLocationHit(h));
        }
        entries = [...bySlug.values()];
      } else {
        const salons = await api.get<PublicSalonSummary[]>('/public/salons');
        entries = salons.map(fromSummary);
      }
      set({ directory: entries, directoryLoading: false });
    } catch (err) {
      set({ directoryLoading: false, directoryError: err instanceof ApiError ? err.message : 'Erreur de chargement' });
    }
  },

  sponsored: [],
  sponsoredLoading: false,
  sponsoredError: null,
  fetchSponsored: async (limit = 8) => {
    set({ sponsoredLoading: true, sponsoredError: null });
    try {
      const sponsored = await api.get<SponsoredEntry[]>('/discovery/sponsored', { limit });
      set({ sponsored, sponsoredLoading: false });
    } catch (err) {
      set({ sponsoredLoading: false, sponsoredError: err instanceof ApiError ? err.message : 'Erreur de chargement' });
    }
  },
}));
