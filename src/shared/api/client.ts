import axios, { AxiosError, type AxiosInstance } from 'axios';
import { TOKEN_STORAGE_KEY } from '@/shared/auth/types';

/** Forme d'enveloppe renvoyée par le backend (convention #1). */
export interface ApiEnvelope<T> {
  data: T;
  message: string;
  statusCode: number;
}

export class ApiError extends Error {
  statusCode: number;
  /** Champs additionnels portés par l'enveloppe d'erreur (ex. { conflicts } sur 409). */
  details?: Record<string, unknown>;
  constructor(message: string, statusCode: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Injecte le Bearer token (lu en localStorage, écrit par authStore) sur chaque requête.
instance.interceptors.request.use((config) => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Déballe l'enveloppe : response.data devient directement le `data` métier.
instance.interceptors.response.use(
  (response) => {
    const body = response.data as ApiEnvelope<unknown> | undefined;
    if (body && typeof body === 'object' && 'data' in body) {
      response.data = body.data;
    }
    return response;
  },
  (error: AxiosError<ApiEnvelope<unknown>>) => {
    const env = error.response?.data;
    const message = env?.message || error.message || 'Network error';
    const statusCode = env?.statusCode || error.response?.status || 0;
    // En cas d'erreur, l'enveloppe transporte les détails (ex. { conflicts }) dans `data`.
    const details =
      env && typeof env.data === 'object' && env.data !== null
        ? (env.data as Record<string, unknown>)
        : undefined;
    return Promise.reject(new ApiError(message, statusCode, details));
  },
);

/** Helpers typés : renvoient directement la donnée déballée. */
export const api = {
  get: async <T>(url: string, params?: Record<string, unknown>): Promise<T> =>
    (await instance.get<T>(url, { params })).data,
  post: async <T>(url: string, body?: unknown): Promise<T> => (await instance.post<T>(url, body)).data,
  patch: async <T>(url: string, body?: unknown): Promise<T> => (await instance.patch<T>(url, body)).data,
  put: async <T>(url: string, body?: unknown): Promise<T> => (await instance.put<T>(url, body)).data,
  delete: async <T>(url: string): Promise<T> => (await instance.delete<T>(url)).data,
  raw: instance,
};

export default api;
