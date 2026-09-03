import { api } from '@/shared/api/client';

export interface PublicStylistProfile {
  id: string;
  name: string;
  role: string;
  color: string;
  title: string;
  bio: string;
}

export function fetchPublicTeam(salonSlug: string): Promise<PublicStylistProfile[]> {
  return api.get<PublicStylistProfile[]>(`/public/salons/${salonSlug}/team`);
}

// Mêmes teintes de portrait que la section "The Team" de la landing (cohérence visuelle).
export const STYLIST_TONES = ['ph-3', 'ph-7', 'ph-2', 'ph-5', 'ph-4', 'ph-6'] as const;
