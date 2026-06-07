const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const BASE = `${API_URL}/api/services`

function authHeaders() {
  const token = localStorage.getItem('haire_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.message || `Services API ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.status === 204 ? null : res.json()
}

export const servicesApi = {
  list:         (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
    ).toString()
    return req(qs ? `?${qs}` : '')
  },
  categories:   ()                     => req('/categories'),
  popular:      ()                     => req('/popular'),
  get:          (id)                   => req(`/${id}`),
  create:       (dto)                  => req('', { method: 'POST', body: JSON.stringify(dto) }),
  update:       (id, dto)              => req(`/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),
  toggleActive: (id)                   => req(`/${id}/toggle-active`, { method: 'PATCH' }),
  reorder:      (items)                => req('/reorder', { method: 'PATCH', body: JSON.stringify({ items }) }),
  remove:       (id)                   => req(`/${id}`, { method: 'DELETE' }),
}

export default servicesApi
