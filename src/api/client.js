// src/api/client.js - API client with JWT token support
const API_BASE = '/api';

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
  
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch (err) {
    // Lỗi mạng, mất kết nối hoặc server ngắt kết nối
    throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    if (err && err.error) {
      throw new Error(err.error);
    }
    
    // Báo lỗi theo StatusCode nếu không có message từ API
    switch (res.status) {
      case 400: throw new Error('Dữ liệu yêu cầu không hợp lệ. Vui lòng kiểm tra lại.');
      case 401: throw new Error('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
      case 403: throw new Error('Bạn không có quyền thực hiện thao tác này.');
      case 404: throw new Error('Dữ liệu yêu cầu không tồn tại trên hệ thống.');
      case 409: throw new Error('Dữ liệu đã tồn tại hoặc có xung đột xảy ra.');
      case 500: throw new Error('Lỗi hệ thống máy chủ (500). Vui lòng thử lại sau.');
      case 502: case 503: case 504: throw new Error('Máy chủ đang bảo trì hoặc phản hồi quá chậm. Vui lòng thử lại sau.');
      default: throw new Error(`Yêu cầu thất bại (Mã lỗi: HTTP ${res.status})`);
    }
  }

  return res.json();
}

export const api = {
  // Auth
  register:          (data)        => apiFetch('/auth/register',  { method: 'POST', body: JSON.stringify(data) }),
  login:             (data)        => apiFetch('/auth/login',     { method: 'POST', body: JSON.stringify(data) }),
  getMe:             ()            => apiFetch('/auth/me'),
  updateProfile:     (data)        => apiFetch('/auth/profile',   { method: 'PATCH', body: JSON.stringify(data) }),
  sendOTP:           (phone)       => apiFetch('/auth/send-otp',  { method: 'POST',  body: JSON.stringify({ phone }) }),
  verifyOTP:         (data)        => apiFetch('/auth/verify-otp', { method: 'POST',  body: JSON.stringify(data) }),

  // Matches
  getMatches:        (params = {}) => apiFetch('/matches?' + new URLSearchParams(params).toString()),
  getMatch:          (id)          => apiFetch(`/matches/${id}`),
  createMatch:       (data)        => apiFetch('/matches',        { method: 'POST',  body: JSON.stringify(data) }),
  closeMatch:        (id)          => apiFetch(`/matches/${id}/close`, { method: 'PATCH' }),

  // Courts
  getCourts:         ()            => apiFetch('/courts'),

  // Participants & AI Verification
  joinMatch:         (id, data)    => apiFetch(`/matches/${id}/join`,     { method: 'POST',  body: JSON.stringify(data) }),
  cancelParticipant: (pid)         => apiFetch(`/participants/${pid}/cancel`, { method: 'POST' }),
  updateDeposit:     (pid, status) => apiFetch(`/participants/${pid}/deposit`, { method: 'PATCH', body: JSON.stringify({ deposit_status: status }) }),
  verifyBill:        (data)        => apiFetch('/verify-bill',    { method: 'POST',  body: JSON.stringify(data) }),
};
