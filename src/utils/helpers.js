// src/utils/helpers.js - Shared utility functions

export function fmtCurrency(n) {
  if (!n || n === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

export function fmtDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const dayName = days[d.getDay()];
  return `${dayName}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export function fmtTime(timeStr) {
  if (!timeStr) return '';
  return timeStr.substring(0, 5);
}

export function fmtPhone(phone) {
  if (!phone) return '';
  // mask: 0912***678
  if (phone.length >= 10) {
    return phone.substring(0, 4) + '***' + phone.substring(7);
  }
  return phone;
}

export function avatarColor(name) {
  const colors = [
    ['#00F5C4', '#0A0E1A'], ['#AAFF00', '#0A0E1A'], ['#7C3AED', '#fff'],
    ['#3B82F6', '#fff'], ['#F97316', '#fff'], ['#EC4899', '#fff'],
    ['#14B8A6', '#fff'], ['#EAB308', '#0A0E1A'],
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function avatarInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export function skillBadgeClass(level) {
  const map = {
    'Mới chơi': 'badge-blue',
    'Trung bình': 'badge-mint',
    'Khá/Tốt': 'badge-lime',
    'Tất cả trình độ': 'badge-purple',
  };
  return map[level] || 'badge-gray';
}

export function depositBadge(status) {
  const map = {
    paid:    { label: '✅ Đã cọc', cls: 'badge-green' },
    pending: { label: '⏳ Chờ cọc', cls: 'badge-yellow' },
    waived:  { label: '🆓 Miễn cọc', cls: 'badge-gray' },
  };
  return map[status] || { label: status, cls: 'badge-gray' };
}

export function isMatchToday(dateStr) {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

export function isMatchTomorrow(dateStr) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return dateStr === tomorrow.toISOString().split('T')[0];
}

export function slotPercent(confirmed, max) {
  return Math.min(100, Math.round((confirmed / max) * 100));
}

export function slotProgressClass(confirmed, max) {
  const pct = slotPercent(confirmed, max);
  if (pct >= 100) return 'full';
  if (pct >= 75)  return 'high';
  return '';
}

/** Generate VietQR image URL */
export function vietQRUrl({ bankId, accountNo, amount, info, accountName }) {
  const base = 'https://img.vietqr.io/image';
  const params = new URLSearchParams({
    amount: amount || 0,
    addInfo: info || '',
    accountName: accountName || '',
  });
  return `${base}/${bankId}-${accountNo}-print.jpg?${params.toString()}`;
}

/** Supported banks for VietQR (short codes) */
export const BANKS = [
  { name: 'Vietcombank (VCB)',     code: 'VCB' },
  { name: 'MB Bank',               code: 'MB' },
  { name: 'Techcombank (TCB)',     code: 'TCB' },
  { name: 'BIDV',                   code: 'BIDV' },
  { name: 'Agribank',               code: 'AGR' },
  { name: 'VietinBank',             code: 'ICB' },
  { name: 'ACB',                    code: 'ACB' },
  { name: 'Sacombank',              code: 'STB' },
  { name: 'TPBank',                 code: 'TPB' },
  { name: 'VPBank',                 code: 'VPB' },
  { name: 'OCB',                    code: 'OCB' },
  { name: 'HDBank',                 code: 'HDB' },
  { name: 'SHB',                    code: 'SHB' },
];

export const SKILL_LEVELS = ['Mới chơi', 'Trung bình', 'Khá/Tốt', 'Tất cả trình độ'];
export const CITIES = ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'];
export const SHUTTLECOCKS = ['Ba Sao', 'Hải Yến', 'Thành Công', 'RSL', 'Victor'];

export const HN_DISTRICTS = [
  'Ba Đình', 'Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Hoàn Kiếm',
  'Hoàng Mai', 'Long Biên', 'Nam Từ Liêm', 'Tây Hồ', 'Thanh Xuân', 'Bắc Từ Liêm',
];
export const HCM_DISTRICTS = [
  'Quận 1', 'Quận 3', 'Quận 7', 'Quận 10', 'Bình Thạnh',
  'Gò Vấp', 'Phú Nhuận', 'Tân Bình', 'Thủ Đức',
];
export const DN_DISTRICTS = ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu'];
