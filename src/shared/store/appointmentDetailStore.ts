import { create } from 'zustand';

interface AppointmentDetailStore {
  openId: string | null;
  open: (id: string) => void;
  close: () => void;
}

/** État global pour ouvrir le modal de détails RDV depuis n'importe où (planning, cloche notifs). */
export const useAppointmentDetailStore = create<AppointmentDetailStore>((set) => ({
  openId: null,
  open: (id) => set({ openId: id }),
  close: () => set({ openId: null }),
}));
