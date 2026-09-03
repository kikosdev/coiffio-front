import { create } from 'zustand';
import api from '@/shared/api/client';
import { DEFAULT_SALON_SLUG } from '@/shared/config/deploymentMode';

const BASE = `/public/salons/${DEFAULT_SALON_SLUG}`;

export interface SalonPublic { name: string; slug?: string; locale: string; }
export interface LandingContent {
  eyebrow: string;
  headlineLine1: string;
  headlineEmphasis: string;
  headlineLine2: string;
  heroParagraph: string;
  philosophyTitle: string;
  philosophyParagraphs: string[];
  pressQuote: string;
  pressAttribution: string;
}
export interface SignatureService { title: string; duration: string; fromPrice: number; }
export interface LandingStats { yearsOpen: number; stylistsCount: number; loyalClients: number; }
export interface SalonContact { addressLine: string; addressNote: string; phone: string; email: string; walkIns: string; lat?: number; lng?: number; }
export interface SalonHours { label: string; range: string; }
export interface PublicService { _id: string; name: string; category: string; gender: string; price: number; durationMin: number; color: string; }
export interface PublicStylist { _id: string; name: string; role: string; publicTitle: string; seniorityTag: string; level: string; landingOrder: number; nextSlot: string | null; }
export interface PublicTestimonial { _id: string; quote: string; authorName: string; authorMeta: string; }

interface LandingPayload {
  salon: SalonPublic;
  landing: LandingContent;
  signature: SignatureService | null;
  stats: LandingStats;
  contact: SalonContact;
  hours: SalonHours[];
}

interface LandingStore {
  loading: boolean;
  error: string | null;
  salon: SalonPublic | null;
  landing: LandingContent | null;
  signature: SignatureService | null;
  stats: LandingStats | null;
  contact: SalonContact | null;
  hours: SalonHours[];
  services: PublicService[];
  team: PublicStylist[];
  testimonials: PublicTestimonial[];
  fetchLanding: () => Promise<void>;
}

export const useLandingStore = create<LandingStore>((set) => ({
  loading: false,
  error: null,
  salon: null,
  landing: null,
  signature: null,
  stats: null,
  contact: null,
  hours: [],
  services: [],
  team: [],
  testimonials: [],

  fetchLanding: async () => {
    set({ loading: true, error: null });

    const [landingRes, servicesRes, teamRes, testimonialRes] = await Promise.allSettled([
      api.get<LandingPayload>(`${BASE}/landing`),
      api.get<PublicService[]>(`${BASE}/services`),
      api.get<PublicStylist[]>(`${BASE}/team`),
      api.get<PublicTestimonial[]>(`${BASE}/testimonials`),
    ]);

    const updates: Partial<LandingStore> = { loading: false };

    if (landingRes.status === 'fulfilled') {
      const d = landingRes.value;
      updates.salon = d.salon;
      updates.landing = d.landing;
      updates.signature = d.signature;
      updates.stats = d.stats;
      updates.contact = d.contact;
      updates.hours = d.hours;
    } else {
      updates.error = (landingRes.reason as Error)?.message ?? 'Failed to load';
    }

    if (servicesRes.status === 'fulfilled') updates.services = servicesRes.value;
    if (teamRes.status === 'fulfilled') updates.team = teamRes.value;
    if (testimonialRes.status === 'fulfilled') updates.testimonials = testimonialRes.value;

    set(updates);
  },
}));
