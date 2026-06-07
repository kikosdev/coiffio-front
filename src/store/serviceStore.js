import { create } from 'zustand'
import { servicesApi } from '../services/servicesApi'

const SEED_SERVICES = [
  { _id: 's1', name: 'Coupe Femme',         category: 'HAIRCUT',   duration: 45,  price: 45,  costPrice: 8,  isActive: true, displayOrder: 1,  color: '#B89968', requiredJobs: [] },
  { _id: 's2', name: 'Coupe Homme',          category: 'HAIRCUT',   duration: 30,  price: 28,  costPrice: 5,  isActive: true, displayOrder: 2,  color: '#B89968', requiredJobs: [] },
  { _id: 's3', name: 'Coupe Enfant',         category: 'HAIRCUT',   duration: 20,  price: 18,  costPrice: 4,  isActive: true, displayOrder: 3,  color: '#B89968', requiredJobs: [] },
  { _id: 's4', name: 'Couleur Racines',      category: 'COLORING',  duration: 60,  price: 55,  costPrice: 18, isActive: true, displayOrder: 4,  color: '#8B6914', requiredJobs: [] },
  { _id: 's5', name: 'Balayage',             category: 'COLORING',  duration: 120, price: 95,  costPrice: 28, isActive: true, displayOrder: 5,  color: '#8B6914', requiredJobs: [] },
  { _id: 's6', name: 'Mèches',              category: 'COLORING',  duration: 90,  price: 75,  costPrice: 22, isActive: true, displayOrder: 6,  color: '#8B6914', requiredJobs: [] },
  { _id: 's7', name: 'Patine',              category: 'COLORING',  duration: 45,  price: 35,  costPrice: 10, isActive: true, displayOrder: 7,  color: '#8B6914', requiredJobs: [] },
  { _id: 's8', name: 'Soin Profond',         category: 'TREATMENT', duration: 30,  price: 25,  costPrice: 6,  isActive: true, displayOrder: 8,  color: '#4A7C59', requiredJobs: [] },
  { _id: 's9', name: 'Botox Capillaire',     category: 'TREATMENT', duration: 60,  price: 65,  costPrice: 20, isActive: true, displayOrder: 9,  color: '#4A7C59', requiredJobs: [] },
  { _id:'s10', name: 'Brushing',             category: 'STYLING',   duration: 30,  price: 22,  costPrice: 4,  isActive: true, displayOrder: 10, color: '#6B5B95', requiredJobs: [] },
  { _id:'s11', name: 'Coiffure Événement',  category: 'STYLING',   duration: 60,  price: 55,  costPrice: 10, isActive: true, displayOrder: 11, color: '#6B5B95', requiredJobs: [] },
  { _id:'s12', name: 'Taille de Barbe',      category: 'BEARD',     duration: 20,  price: 15,  costPrice: 3,  isActive: true, displayOrder: 12, color: '#2F4F6F', requiredJobs: [] },
]

export const CATEGORY_LABELS = {
  HAIRCUT:    'Coupe',
  COLORING:   'Coloration',
  TREATMENT:  'Soin',
  STYLING:    'Coiffage',
  EXTENSIONS: 'Extensions',
  BEARD:      'Barbe',
  KIDS:       'Enfants',
  OTHER:      'Autre',
}

export const CATEGORY_COLORS = {
  HAIRCUT:    '#B89968',
  COLORING:   '#8B6914',
  TREATMENT:  '#4A7C59',
  STYLING:    '#6B5B95',
  EXTENSIONS: '#C25E5E',
  BEARD:      '#2F4F6F',
  KIDS:       '#D4875A',
  OTHER:      '#888',
}

export const useServiceStore = create((set, get) => ({
  services:   SEED_SERVICES,
  categories: [],
  popular:    [],
  filters: {
    search:   '',
    category: '',
    showInactive: false,
  },
  isLoading: false,
  error:     null,

  setFilter: (key, value) =>
    set(s => ({ filters: { ...s.filters, [key]: value } })),

  fetchServices: async () => {
    const { filters } = get()
    set({ isLoading: true, error: null })
    try {
      const params = {}
      if (filters.search)   params.search   = filters.search
      if (filters.category) params.category  = filters.category
      if (!filters.showInactive) params.isActive = true
      const res = await servicesApi.list(params)
      set({ services: res.data ?? res, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchCategories: async () => {
    try {
      const cats = await servicesApi.categories()
      set({ categories: cats })
    } catch { /* silently use empty */ }
  },

  fetchPopular: async () => {
    try {
      const pop = await servicesApi.popular()
      set({ popular: pop })
    } catch { /* silently use empty */ }
  },

  createService: async (dto) => {
    set({ isLoading: true, error: null })
    try {
      const svc = await servicesApi.create(dto)
      set(s => ({ services: [...s.services, svc], isLoading: false }))
      return svc
    } catch (e) {
      set({ isLoading: false, error: e.message })
      throw e
    }
  },

  updateService: async (id, dto) => {
    set({ isLoading: true, error: null })
    try {
      const svc = await servicesApi.update(id, dto)
      set(s => ({ services: s.services.map(x => x._id === id ? svc : x), isLoading: false }))
      return svc
    } catch (e) {
      set({ isLoading: false, error: e.message })
      throw e
    }
  },

  toggleService: async (id) => {
    try {
      const svc = await servicesApi.toggleActive(id)
      set(s => ({ services: s.services.map(x => x._id === id ? svc : x) }))
    } catch (e) {
      set({ error: e.message })
    }
  },

  deleteService: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await servicesApi.remove(id)
      set(s => ({ services: s.services.filter(x => x._id !== id), isLoading: false }))
    } catch (e) {
      set({ isLoading: false, error: e.message })
      throw e
    }
  },

  optimisticLocalCreate: (dto) => {
    const local = { ...dto, _id: `local-${Date.now()}`, isActive: true }
    set(s => ({ services: [...s.services, local] }))
  },

  optimisticLocalUpdate: (id, dto) => {
    set(s => ({ services: s.services.map(x => x._id === id ? { ...x, ...dto } : x) }))
  },
}))
