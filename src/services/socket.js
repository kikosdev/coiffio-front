import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const socket = io(`${API_URL}/ws`, {
  autoConnect: false,
  auth: { token: localStorage.getItem('haire_token') },
});

export function connectSocket() {
  socket.auth = { token: localStorage.getItem('haire_token') };
  if (!socket.connected) socket.connect();
}

export function disconnectSocket() {
  if (socket.connected) socket.disconnect();
}
