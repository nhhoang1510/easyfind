// src/api/client.js - API client with JWT token support
const API_BASE = 'http://localhost:3001/api';

function getToken() {
  return localStorage.getItem('kcp_token');
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  register:          (data)        => apiFetch('/auth/register',  { method: 'POST', body: JSON.stringify(data) }),
  login:             (data)        => apiFetch('/auth/login',     { method: 'POST', body: JSON.stringify(data) }),
  getMe:             ()            => apiFetch('/auth/me'),
  updateProfile:     (data)        => apiFetch('/auth/profile',   { method: 'PATCH', body: JSON.stringify(data) }),

  // Matches
  getMatches:        (params = {}) => apiFetch('/matches?' + new URLSearchParams(params).toString()),
  getMatch:          (id)          => apiFetch(`/matches/${id}`),
  createMatch:       (data)        => apiFetch('/matches',        { method: 'POST',  body: JSON.stringify(data) }),
  closeMatch:        (id)          => apiFetch(`/matches/${id}/close`, { method: 'PATCH' }),

  // Courts
  getCourts:         ()            => apiFetch('/courts'),

  // Participants
  joinMatch:         (id, data)    => apiFetch(`/matches/${id}/join`,     { method: 'POST',  body: JSON.stringify(data) }),
  cancelParticipant: (pid)         => apiFetch(`/participants/${pid}/cancel`, { method: 'POST' }),
  updateDeposit:     (pid, status) => apiFetch(`/participants/${pid}/deposit`, { method: 'PATCH', body: JSON.stringify({ deposit_status: status }) }),
};
