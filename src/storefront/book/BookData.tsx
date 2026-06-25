import { api } from '@/shared/api/client';

const SALON_SLUG = (import.meta.env.VITE_DEFAULT_SALON_SLUG as string | undefined) ?? 'salon-haire';

export interface PublicStylistProfile {
  id: string;
  name: string;
  role: string;
  color: string;
  title: string;
  bio: string;
}

export function fetchPublicTeam(): Promise<PublicStylistProfile[]> {
  return api.get<PublicStylistProfile[]>(`/public/salons/${SALON_SLUG}/team`);
}

// Mêmes teintes de portrait que la section "The Team" de la landing (cohérence visuelle).
export const STYLIST_TONES = ['ph-3', 'ph-7', 'ph-2', 'ph-5', 'ph-4', 'ph-6'] as const;
