/** Rôles — miroir exact du backend. */
export type Role = 'owner' | 'manager' | 'stylist' | 'colorist' | 'client';

/** Profil public renvoyé par /auth/* (jamais de passwordHash). */
export interface AuthUser {
  id: string;
  salonId: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  /** Hex color — present for staff accounts, undefined for clients. */
  color?: string;
  isActive: boolean;
  registered: boolean;
  /** 'staff' for owner/manager/stylist/colorist, 'client' for client accounts. */
  accountType: 'staff' | 'client';
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

/** owner/manager/stylist/colorist → backoffice ; client → storefront/my-account. */
export const BACKOFFICE_ROLES: Role[] = ['owner', 'manager', 'stylist', 'colorist'];

export function isBackoffice(role: Role | undefined): boolean {
  return !!role && BACKOFFICE_ROLES.includes(role);
}

export const TOKEN_STORAGE_KEY = 'salon_token';
