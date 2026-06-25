import { create } from 'zustand';
import { api, ApiError } from '@/shared/api/client';
import { localDateISO } from '@/shared/date';

export type Gender = 'men' | 'women' | 'universal';
export type Audience = 'all' | 'men' | 'women';

export interface BookService {
  _id: string;
  name: string;
  category: string;
  gender: Gender;
  price: number;
  durationMin: number;
  bufferMin: number;
  color: string;
}

export interface BookForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  isFirstTime: boolean;
  smsReminder: boolean;
  terms: boolean;
}

export interface BookResult {
  id: string;
  reference: string;
  email: string;
  stylistName: string;
  dateLabel: string;
  time: string;
}

export const ANY_STYLIST = '__any';

function todayISO(): string {
  return localDateISO();
}

interface BookStore {
  step: 1 | 2 | 3 | 4;
  catalog: BookService[];
  catalogLoading: boolean;
  selectedServiceIds: string[];
  date: string;
  stylistId: string;       // '' | id | ANY_STYLIST
  stylistName: string;
  slotStart: string;       // ISO
  slotTime: string;        // 'HH:mm'
  form: BookForm;
  done: boolean;
  result: BookResult | null;
  error: string | null;

  fetchCatalog: () => Promise<void>;
  toggleService: (id: string) => void;
  removeService: (id: string) => void;
  setDate: (d: string) => void;
  setStylist: (id: string, name: string) => void;
  setSlot: (startISO: string, time: string) => void;
  lockStylist: (id: string, name: string) => void;
  setForm: (patch: Partial<BookForm>) => void;
  setStep: (n: 1 | 2 | 3 | 4) => void;
  next: () => void;
  back: () => void;
  setDone: (r: BookResult) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

const EMPTY_FORM: BookForm = {
  firstName: '', lastName: '', email: '', phone: '', notes: '',
  isFirstTime: true, smsReminder: true, terms: false,
};

export const useBookStore = create<BookStore>((set) => ({
  step: 1,
  catalog: [],
  catalogLoading: false,
  selectedServiceIds: [],
  date: todayISO(),
  stylistId: '',
  stylistName: '',
  slotStart: '',
  slotTime: '',
  form: { ...EMPTY_FORM },
  done: false,
  result: null,
  error: null,

  fetchCatalog: async () => {
    set({ catalogLoading: true });
    try {
      const catalog = await api.get<BookService[]>('/book/services');
      set({ catalog, catalogLoading: false });
    } catch (err) {
      set({ catalogLoading: false, error: err instanceof ApiError ? err.message : 'Erreur de chargement' });
    }
  },

  toggleService: (id) =>
    set((s) => ({
      selectedServiceIds: s.selectedServiceIds.includes(id)
        ? s.selectedServiceIds.filter((x) => x !== id)
        : [...s.selectedServiceIds, id],
      stylistId: '',
      stylistName: '',
      slotStart: '',
      slotTime: '',
    })),

  removeService: (id) =>
    set((s) => ({
      selectedServiceIds: s.selectedServiceIds.filter((x) => x !== id),
      stylistId: '',
      stylistName: '',
      slotStart: '',
      slotTime: '',
    })),

  setDate: (date) => set({ date, slotStart: '', slotTime: '' }),
  setStylist: (stylistId, stylistName) => set({ stylistId, stylistName, slotStart: '', slotTime: '' }),
  setSlot: (slotStart, slotTime) => set({ slotStart, slotTime }),
  lockStylist: (stylistId, stylistName) => set({ stylistId, stylistName }),
  setForm: (patch) => set((s) => ({ form: { ...s.form, ...patch } })),
  setStep: (step) => set({ step, error: null }),
  next: () => set((s) => ({ step: Math.min(s.step + 1, 4) as 1 | 2 | 3 | 4, error: null })),
  back: () => set((s) => ({ step: Math.max(s.step - 1, 1) as 1 | 2 | 3 | 4, error: null })),
  setDone: (result) => set({ result, done: true }),
  setError: (error) => set({ error }),

  reset: () =>
    set({
      step: 1, selectedServiceIds: [], date: todayISO(), stylistId: '', stylistName: '',
      slotStart: '', slotTime: '', form: { ...EMPTY_FORM }, done: false, result: null, error: null,
    }),
}));

// ─── Helpers ───
export function fmtDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  const hh = Math.floor((total % (24 * 60)) / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export interface DateChip { offset: number; iso: string; dow: string; num: number; mon: string; label: string | null; }

export function dateChips(): DateChip[] {
  const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const out: DateChip[] = [];
  for (let i = 0; i < 14; i += 1) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push({
      offset: i,
      iso: localDateISO(d),
      dow: DOW[d.getDay()],
      num: d.getDate(),
      mon: MON[d.getMonth()],
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : null,
    });
  }
  return out;
}

export function audienceAllows(aud: Audience, gender: Gender): boolean {
  if (aud === 'men') return gender !== 'women';
  if (aud === 'women') return gender !== 'men';
  return true;
}
