import { create } from 'zustand';
import { api } from '@/shared/api/client';
import {
  type AuthResult,
  type AuthUser,
  TOKEN_STORAGE_KEY,
} from '@/shared/auth/types';

type Status = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface LoginInput {
  identifier: string;
  password: string;
}
interface RegisterInput {
  name: string;
  identifier: string;
  phone: string;
  password: string;
}
interface ProfileInput {
  name?: string;
  email?: string;
  phone?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  status: Status;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  loadMe: () => Promise<void>;
  updateProfile: (input: ProfileInput) => Promise<void>;
  logout: () => Promise<void>;
}

/** Persiste le token en localStorage (lu par l'api client pour le Bearer). */
function persistToken(token: string | null): void {
  if (typeof localStorage === 'undefined') return;
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
  else localStorage.removeItem(TOKEN_STORAGE_KEY);
}

const initialToken =
  typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: initialToken,
  status: 'idle',

  login: async (input) => {
    set({ status: 'loading' });
    try {
      const res = await api.post<AuthResult>('/auth/login', input);
      persistToken(res.token);
      set({ user: res.user, token: res.token, status: 'authenticated' });
      return res.user;
    } catch (err) {
      set({ status: 'unauthenticated' });
      throw err;
    }
  },

  register: async (input) => {
    set({ status: 'loading' });
    try {
      const res = await api.post<AuthResult>('/auth/register', input);
      persistToken(res.token);
      set({ user: res.user, token: res.token, status: 'authenticated' });
      return res.user;
    } catch (err) {
      set({ status: 'unauthenticated' });
      throw err;
    }
  },

  loadMe: async () => {
    if (!get().token) {
      set({ status: 'unauthenticated' });
      return;
    }
    set({ status: 'loading' });
    try {
      const user = await api.get<AuthUser>('/auth/me');
      set({ user, status: 'authenticated' });
    } catch {
      persistToken(null);
      set({ user: null, token: null, status: 'unauthenticated' });
    }
  },

  updateProfile: async (input) => {
    const user = await api.patch<AuthUser>('/auth/me', input);
    set({ user });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // best-effort : on nettoie l'état local quoi qu'il arrive
    }
    persistToken(null);
    set({ user: null, token: null, status: 'unauthenticated' });
  },
}));
