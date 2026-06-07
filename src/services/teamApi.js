// Client REST pour la section Équipe (Team). Tous les appels sont défensifs :
// en l'absence de backend joignable, l'UI retombe sur les données SEED locales.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const BASE = `${API_URL}/api/team`

function authHeaders() {
  const token = localStorage.getItem('haire_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    ...options,
  })
  if (!res.ok) throw new Error(`Team API ${res.status} on ${path}`)
  return res.status === 204 ? null : res.json()
}

export const teamApi = {
  list:            ()                 => req(''),
  leaveRequests:   ()                 => req('/leave-requests'),
  periods:         ()                 => req('/periods'),
  create:          (member)           => req('', { method: 'POST', body: JSON.stringify(member) }),
  update:          (id, patch)        => req(`/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  remove:          (id)               => req(`/${id}`, { method: 'DELETE' }),
  setWeek:         (id, week)         => req(`/${id}/week`, { method: 'PUT', body: JSON.stringify({ week }) }),
  setDay:          (id, day, value)   => req(`/${id}/week/${day}`, { method: 'PATCH', body: JSON.stringify({ value }) }),
  decideLeave:     (id, decided)      => req(`/leave-requests/${id}/decision`, { method: 'PATCH', body: JSON.stringify({ decided }) }),
  payslip:         (id, periodId)     => req(`/${id}/payslip?period=${periodId}`),
}

export default teamApi
