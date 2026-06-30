import { io, type Socket } from 'socket.io-client';

/**
 * Singleton Socket.io (autoConnect:false). Les rooms sont jointes côté serveur
 * depuis le JWT (convention #8) — jamais de join côté client.
 */
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      withCredentials: true,
    });
  }
  return socket;
}

export function connectSocket(token?: string): Socket {
  const s = getSocket();
  if (token) s.auth = { token };
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket(): void {
  if (socket?.connected) socket.disconnect();
}
