import { create } from 'zustand';
import { api, ApiError } from '@/shared/api/client';
import { connectSocket, disconnectSocket, getSocket } from '@/shared/socket/socket';
import { SOCKET_EVENTS, type SocketEvent } from '@/shared/socket-events';

export interface Notif {
  _id: string;
  type: string;
  payload: Record<string, unknown>;
  read: boolean;
  date: string;
}

interface NotifStore {
  items: Notif[];
  initialized: boolean;
  unread: () => number;
  unreadByType: (types: string[]) => number;
  init: (token: string) => void;
  teardown: () => void;
  fetch: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  readAll: () => Promise<void>;
}

const ALL_EVENTS: SocketEvent[] = Object.values(SOCKET_EVENTS);

export const useNotifStore = create<NotifStore>((set, get) => ({
  items: [],
  initialized: false,

  unread: () => get().items.filter((n) => !n.read).length,
  unreadByType: (types) => get().items.filter((n) => !n.read && types.includes(n.type)).length,

  init: (token) => {
    if (get().initialized) return;
    const socket = connectSocket(token);
    const onEvent = (notif: Notif) => set((s) => ({ items: [notif, ...s.items].slice(0, 100) }));
    ALL_EVENTS.forEach((ev) => socket.on(ev, onEvent));
    set({ initialized: true });
    void get().fetch();
  },

  teardown: () => {
    const socket = getSocket();
    ALL_EVENTS.forEach((ev) => socket.off(ev));
    disconnectSocket();
    set({ initialized: false, items: [] });
  },

  fetch: async () => {
    try {
      const items = await api.get<Notif[]>('/notifications');
      set({ items });
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
    }
  },

  markRead: async (id) => {
    set((s) => ({ items: s.items.map((n) => (n._id === id ? { ...n, read: true } : n)) }));
    await api.post(`/notifications/${id}/read`, {});
  },

  readAll: async () => {
    set((s) => ({ items: s.items.map((n) => ({ ...n, read: true })) }));
    await api.post('/notifications/read-all', {});
  },
}));
