import { create } from 'zustand'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function authHeader() {
  const token = localStorage.getItem('haire_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const useOrdersStore = create((set, get) => ({
  orders:    [],
  total:     0,
  page:      0,
  limit:     20,
  filters:   {},
  stats:     null,
  selected:  null,
  isLoading: false,
  error:     null,

  setFilters(f) {
    set(s => ({ filters: { ...s.filters, ...f }, page: 0 }))
  },

  async fetch() {
    set({ isLoading: true, error: null })
    try {
      const { filters, page, limit } = get()
      const params = { ...filters, page, limit }
      const res = await axios.get(`${API}/api/orders`, { params, headers: authHeader() })
      const data = res.data
      set({ orders: data.items ?? data, total: data.total ?? 0, isLoading: false })
    } catch (e) {
      set({ error: e.message, isLoading: false })
    }
  },

  async fetchStats() {
    try {
      const res = await axios.get(`${API}/api/orders/stats`, { headers: authHeader() })
      set({ stats: res.data })
    } catch { /* ignore */ }
  },

  async getById(id) {
    set({ isLoading: true })
    try {
      const res = await axios.get(`${API}/api/orders/${id}`, { headers: authHeader() })
      set({ selected: res.data, isLoading: false })
      return res.data
    } catch (e) {
      set({ isLoading: false })
      throw e
    }
  },

  async updateStatus(id, status, note) {
    const res = await axios.patch(
      `${API}/api/orders/${id}/status`,
      { status, note },
      { headers: authHeader() },
    )
    set(s => ({
      orders:   s.orders.map(o => o._id === id ? res.data : o),
      selected: s.selected?._id === id ? res.data : s.selected,
    }))
    return res.data
  },

  async updatePaymentStatus(id, paymentStatus) {
    const res = await axios.patch(
      `${API}/api/orders/${id}/payment-status`,
      { paymentStatus },
      { headers: authHeader() },
    )
    set(s => ({
      orders:   s.orders.map(o => o._id === id ? res.data : o),
      selected: s.selected?._id === id ? res.data : s.selected,
    }))
    return res.data
  },

  async updateNotes(id, internalNotes) {
    const res = await axios.patch(
      `${API}/api/orders/${id}/notes`,
      { internalNotes },
      { headers: authHeader() },
    )
    set(s => ({
      selected: s.selected?._id === id ? res.data : s.selected,
    }))
    return res.data
  },
}))
