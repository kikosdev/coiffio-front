/** Path A (multi-salon platform, annuaire = entrée) vs Path B (mono-salon, annuaire masqué). */
export type DeploymentMode = 'platform' | 'single';

export const DEPLOYMENT_MODE: DeploymentMode =
  (import.meta.env.VITE_DEPLOYMENT_MODE as string | undefined) === 'single' ? 'single' : 'platform';

export const isSingleTenant = DEPLOYMENT_MODE === 'single';

/** Slug du salon unique en Path B (mono-salon) — jamais hardcodé ailleurs. */
export const DEFAULT_SALON_SLUG =
  (import.meta.env.VITE_DEFAULT_SALON_SLUG as string | undefined) ?? 'salon-haire';
