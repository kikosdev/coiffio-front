import { useState, useEffect, useCallback } from 'react';
import { socket } from '../services/socket';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api';

function authHeaders() {
  const token = localStorage.getItem('haire_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useNotifications() {
  const [items, setItems]           = useState([]);
  const [unreadCount, setUnread]    = useState(0);
  const [open, setOpen]             = useState(false);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch(`${API}/notifications/unread-count`, { headers: authHeaders() });
      if (res.ok) { const { count } = await res.json(); setUnread(count); }
    } catch { /* no token / offline — silently ignore */ }
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`${API}/notifications?page=0`, { headers: authHeaders() });
      if (res.ok) { const { items: data } = await res.json(); setItems(data); }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchUnread();

    socket.on('notification', (notif) => {
      setItems(prev => [notif, ...prev]);
      setUnread(n => n + 1);
    });

    return () => { socket.off('notification'); };
  }, [fetchUnread]);

  const openPanel = useCallback(() => {
    setOpen(true);
    fetchItems();
  }, [fetchItems]);

  const closePanel = useCallback(() => setOpen(false), []);

  const markRead = useCallback(async (id) => {
    try {
      await fetch(`${API}/notifications/${id}/read`, { method: 'PATCH', headers: authHeaders() });
      setItems(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnread(n => Math.max(0, n - 1));
    } catch { /* ignore */ }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await fetch(`${API}/notifications/read-all`, { method: 'PATCH', headers: authHeaders() });
      setItems(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnread(0);
    } catch { /* ignore */ }
  }, []);

  return { items, unreadCount, open, openPanel, closePanel, markRead, markAllRead };
}
