import { create } from 'zustand';
import { api, ApiError } from '@/shared/api/client';

export interface SlotOption {
  time: string;
  start: string; // ISO
}
export interface StylistAvailability {
  stylistId: string;
  stylistName: string;
  level?: string;
  slots: SlotOption[];
}

export interface TimelineDay {
  date: string; // "YYYY-MM-DD"
  dayOfWeek: string;
  isClosed: boolean;
  stylists: StylistAvailability[];
}

export type AppointmentStatus = 'booked' | 'confirmed' | 'completed' | 'cancelled' | 'noshow';

export interface Appointment {
  _id: string;
  stylistId: string;
  clientId: string;
  groupId: string;
  services: string[];
  start: string;
  end: string;
  status: AppointmentStatus;
  source: 'online' | 'walkin' | 'phone';
  price: number;
  /** Présent sur la réponse d'une création online : lien signé de suivi/annulation (#12). */
  manageToken?: string;
}

export interface CreateAppointmentDto {
  serviceIds: string[];
  stylistId: string;
  clientId?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  start: string;
  source?: 'online' | 'phone';
}

export interface CreateWalkinDto {
  serviceIds: string[];
  stylistId: string;
  clientId?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  start?: string;
}

interface BookingStore {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  availability: StylistAvailability[];
  availabilityLoading: boolean;
  timeline: TimelineDay[];
  timelineLoading: boolean;

  fetchAppointments: (date: string, stylistId?: string) => Promise<void>;
  fetchOne: (id: string) => Promise<Appointment>;
  fetchAvailability: (serviceIds: string[], date: string, stylistId?: string) => Promise<void>;
  fetchTimeline: (serviceIds: string[], startDate: string, stylistId?: string, days?: number) => Promise<void>;
  clearAvailability: () => void;
  book: (dto: CreateAppointmentDto) => Promise<Appointment>;
  walkin: (dto: CreateWalkinDto) => Promise<Appointment>;
  cancel: (id: string) => Promise<void>;

  /** Variantes publiques scopées par slug (annuaire multi-salon) — utilisées par le flow
   * storefront `/book`, distinctes des méthodes ci-dessus qui restent utilisées telles
   * quelles par le backoffice (`NewAppointmentModal`). */
  fetchPublicAvailability: (salonSlug: string, serviceIds: string[], date: string, stylistId?: string) => Promise<void>;
  fetchPublicTimeline: (salonSlug: string, serviceIds: string[], startDate: string, stylistId?: string, days?: number) => Promise<void>;
  bookPublic: (salonSlug: string, dto: CreateAppointmentDto) => Promise<Appointment>;
}

export const useBookingStore = create<BookingStore>((set) => ({
  appointments: [],
  loading: false,
  error: null,
  availability: [],
  availabilityLoading: false,
  timeline: [],
  timelineLoading: false,

  fetchAppointments: async (date, stylistId) => {
    set({ loading: true, error: null });
    try {
      const appointments = await api.get<Appointment[]>('/appointments', {
        date,
        ...(stylistId ? { stylistId } : {}),
      });
      set({ appointments, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof ApiError ? err.message : 'Erreur de chargement' });
    }
  },

  fetchOne: async (id) => {
    const appt = await api.get<Appointment>(`/appointments/${id}`);
    set((s) => ({
      appointments: s.appointments.some((a) => a._id === appt._id)
        ? s.appointments.map((a) => (a._id === appt._id ? appt : a))
        : s.appointments,
    }));
    return appt;
  },

  fetchAvailability: async (serviceIds, date, stylistId) => {
    set({ availabilityLoading: true });
    try {
      const availability = await api.get<StylistAvailability[]>('/availability', {
        serviceIds,
        date,
        ...(stylistId ? { stylistId } : {}),
      });
      set({ availability, availabilityLoading: false });
    } catch (err) {
      set({ availabilityLoading: false, error: err instanceof ApiError ? err.message : 'Erreur' });
    }
  },

  fetchTimeline: async (serviceIds, startDate, stylistId, days) => {
    set({ timelineLoading: true });
    try {
      const timeline = await api.get<TimelineDay[]>('/availability/timeline', {
        serviceIds,
        startDate,
        ...(stylistId ? { stylistId } : {}),
        ...(days ? { days } : {}),
      });
      set({ timeline, timelineLoading: false });
    } catch (err) {
      set({ timelineLoading: false, error: err instanceof ApiError ? err.message : 'Erreur' });
    }
  },

  clearAvailability: () => set({ availability: [] }),

  book: async (dto) => {
    const saved = await api.post<Appointment>('/appointments', dto);
    set((s) => ({ appointments: [...s.appointments, saved].sort((a, b) => a.start.localeCompare(b.start)) }));
    return saved;
  },

  walkin: async (dto) => {
    const saved = await api.post<Appointment>('/appointments/walkin', dto);
    set((s) => ({ appointments: [...s.appointments, saved].sort((a, b) => a.start.localeCompare(b.start)) }));
    return saved;
  },

  cancel: async (id) => {
    const saved = await api.patch<Appointment>(`/appointments/${id}/cancel`, {});
    set((s) => ({ appointments: s.appointments.map((a) => (a._id === id ? saved : a)) }));
  },

  fetchPublicAvailability: async (salonSlug, serviceIds, date, stylistId) => {
    set({ availabilityLoading: true });
    try {
      const availability = await api.get<StylistAvailability[]>(`/${salonSlug}/availability`, {
        serviceIds,
        date,
        ...(stylistId ? { stylistId } : {}),
      });
      set({ availability, availabilityLoading: false });
    } catch (err) {
      set({ availabilityLoading: false, error: err instanceof ApiError ? err.message : 'Erreur' });
    }
  },

  fetchPublicTimeline: async (salonSlug, serviceIds, startDate, stylistId, days) => {
    set({ timelineLoading: true });
    try {
      const timeline = await api.get<TimelineDay[]>(`/${salonSlug}/availability/timeline`, {
        serviceIds,
        startDate,
        ...(stylistId ? { stylistId } : {}),
        ...(days ? { days } : {}),
      });
      set({ timeline, timelineLoading: false });
    } catch (err) {
      set({ timelineLoading: false, error: err instanceof ApiError ? err.message : 'Erreur' });
    }
  },

  bookPublic: async (salonSlug, dto) => {
    const saved = await api.post<Appointment>(`/${salonSlug}/appointments`, dto);
    set((s) => ({ appointments: [...s.appointments, saved].sort((a, b) => a.start.localeCompare(b.start)) }));
    return saved;
  },
}));
