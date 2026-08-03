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
  const parts = timeStr.trim().split(':');
  if (parts.length >= 2) {
    const hh = parts[0].padStart(2, '0');
    const mm = parts[1].padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return timeStr;
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
    'Mới chơi':      'badge-blue',
    'Yếu':           'badge-blue',
    'Trung bình yếu':'badge-mint',
    'Trung bình':    'badge-mint',
    'Trung bình khá':'badge-lime',
    'Khá':           'badge-lime',
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

export const SKILL_LEVELS = ['Mới chơi', 'Yếu', 'Trung bình yếu', 'Trung bình', 'Trung bình khá', 'Khá'];
export const CITIES = ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'];
export const SHUTTLECOCKS = ['Ba Sao', 'Hải Yến', 'Thành Công', 'RSL', 'Victor', 'Khác'];

export const HN_DISTRICTS = [
  'Ba Đình', 'Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Hoàn Kiếm',
  'Hoàng Mai', 'Long Biên', 'Nam Từ Liêm', 'Tây Hồ', 'Thanh Xuân', 'Bắc Từ Liêm',
];
export const HCM_DISTRICTS = [
  'Quận 1', 'Quận 3', 'Quận 7', 'Quận 10', 'Bình Thạnh',
  'Gò Vấp', 'Phú Nhuận', 'Tân Bình', 'Thủ Đức',
];
export const DN_DISTRICTS = ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu'];

/** Helper to format price to '60k', '45k' format */
function fmtK(val) {
  if (!val && val !== 0) return '0k';
  const num = parseInt(String(val).replace(/\D/g, ''), 10);
  if (isNaN(num)) return String(val);
  if (num >= 1000) return `${Math.round(num / 1000)}k`;
  return `${num}k`;
}

/** Helper to format date as '30/7' or '2/8' */
function fmtShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }
  const match = String(dateStr).match(/(\d{1,2})\/(\d{1,2})/);
  if (match) return `${match[1]}/${match[2]}`;
  return dateStr;
}

/** Format match details as Zalo post text */
export function formatZaloMatchPost(match) {
  if (!match) return '';

  const title = match.title ? match.title.toUpperCase() : 'TUYỂN GIAO LƯU CẦU LÔNG';
  const court = `${match.court_name || match.court || ''}${match.court_number ? ` (${match.court_number})` : ''}`;
  const dateStr = fmtShortDate(match.play_date);
  const timeStr = `${match.start_time || ''}-${match.end_time || ''}`;
  const shuttle = match.shuttlecock || 'Ba Sao';

  // Fee lines
  let feeSection = '';
  if (Array.isArray(match.slot_categories) && match.slot_categories.length > 0) {
    const feeLines = match.slot_categories.map((c, i) => {
      const genderLabel = c.gender === 'female' ? 'nữ' : 'nam';
      const costStr = fmtK(c.cost);
      if (i === 0) {
        return `Phí:   ${genderLabel} ${costStr}`;
      }
      return `        ${genderLabel} ${costStr}${i === match.slot_categories.length - 1 ? ` -  Cầu ${shuttle}` : ''}`;
    });
    if (match.slot_categories.length === 1) {
      feeLines[0] += ` -  Cầu ${shuttle}`;
    }
    feeSection = feeLines.join('\n');
  } else {
    const costStr = fmtK(match.cost_per_slot);
    feeSection = `Phí:   ${costStr} -  Cầu ${shuttle}`;
  }

  // Skill lines
  let skillSection = '';
  if (Array.isArray(match.slot_categories) && match.slot_categories.length > 0) {
    const skillLines = match.slot_categories.map((c, i) => {
      const genderLabel = c.gender === 'female' ? 'Nữ' : 'Nam';
      const prefix = i === 0 ? 'Trình :   ' : '        ';
      return `${prefix}${c.skill_level} ( ${genderLabel} )`;
    });
    skillSection = skillLines.join('\n');
  } else {
    skillSection = `Trình :   ${match.skill_level || 'Mọi trình độ'}`;
  }

  const phoneStr = match.host_phone ? ` or Zl ${match.host_phone}` : '';
  const noteStr = match.note ? `  - ${match.note}` : '';

  return [
    title,
    ``,
    court,
    ``,
    `Ca giờ :  ${timeStr}  (Ngày ${dateStr})`,
    ``,
    feeSection,
    ``,
    `Sân max:  ${match.max_slots || 8} slot${noteStr}`,
    ``,
    skillSection,
    ``,
    `Đky liên hệ trực tiếp${phoneStr}`,
    `@All`,
  ].join('\n');
}

