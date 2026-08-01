// server/db.js - PostgreSQL Connection Pool with Mock DB Fallback + Auth Support
import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

const { Pool } = pg;

let pool;
let useMock = false;

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

try {
  if (connectionString) {
    try {
      pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });
      await pool.query('SELECT 1');
    } catch (sslErr) {
      if (sslErr.message && sslErr.message.includes('does not support SSL')) {
        pool = new Pool({
          connectionString,
          ssl: false,
          connectionTimeoutMillis: 5000,
        });
        await pool.query('SELECT 1');
      } else {
        throw sslErr;
      }
    }
  } else if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
    pool = new Pool({
      host:     process.env.DB_HOST,
      port:     parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME     || 'postgres',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD,
      ssl:      { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });
    await pool.query('SELECT 1');
  } else {
    pool = new Pool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME     || 'postgres',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || '1234',
      connectionTimeoutMillis: 2000,
    });
    await pool.query('SELECT 1');
  }
  console.log('✅ Connected to PostgreSQL');
} catch (err) {
  console.warn('⚠️ PostgreSQL connection failed:', err.message);
  console.warn('   Falling back to in-memory Mock DB');
  useMock = true;
  pool = null;
}

// =============================================
// IN-MEMORY MOCK DATABASE
// =============================================
const mockDB = {
  users: [],
  courts: [
    { id: 1, name: 'Sân Cầu Lông Viettel',        address: '1 Giang Văn Minh, Kim Mã, Ba Đình',          district: 'Ba Đình',   city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Viettel+Giang+Văn+Minh' },
    { id: 2, name: 'Sân Cầu Lông Khâm Thiên',     address: '12 Khâm Thiên, Đống Đa',                       district: 'Đống Đa',   city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Khâm+Thiên' },
    { id: 3, name: 'Sân Cầu Lông Cầu Giấy Sport', address: '36 Trần Thái Tông, Cầu Giấy',                   district: 'Cầu Giấy',  city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Trần+Thái+Tông' },
    { id: 4, name: 'Sân Cầu Lông Long Biên Arena', address: '5 Đức Giang, Long Biên',                        district: 'Long Biên', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Long+Biên' },
    { id: 5, name: 'Sân Cầu Lông Thanh Xuân Center', address: '166 Khuất Duy Tiến, Thanh Xuân',             district: 'Thanh Xuân', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Khuất+Duy+Tiến' },
    { id: 6, name: 'Sân Cầu Lông Tây Hồ Complex',  address: '694 Lạc Long Quân, Tây Hồ',                    district: 'Tây Hồ',    city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Lạc+Long+Quân' },
    { id: 7, name: 'Sân Cầu Lông Hà Đông Arena',   address: '8 Quang Trung, Hà Đông',                       district: 'Hà Đông',   city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Quang+Trung+Hà+Đông' },
    { id: 8, name: 'Sân Kỳ Hòa',                  address: '1 Huyền Trân Công Chúa, Quận 1',     district: 'Quận 1',    city: 'TP.HCM', maps_url: 'https://maps.google.com/?q=Sân+Kỳ+Hòa+Quận+1' },
    { id: 9, name: 'Sân Cầu Lông Celadon City',   address: '36 Đặng Văn Bi, Thủ Đức',            district: 'Thủ Đức',   city: 'TP.HCM', maps_url: 'https://maps.google.com/?q=Sân+Celadon+Thủ+Đức' },
    { id: 10, name: 'Sân Cầu Lông Hoàng Long',    address: '45 Lê Văn Lương, Hải Châu',          district: 'Hải Châu',  city: 'Đà Nẵng', maps_url: 'https://maps.google.com/?q=Sân+Hoàng+Long+Đà+Nẵng' },
  ],
  matches: [],
  participants: [],
  nextUserId: 1,
  nextMatchId: 1,
  nextParticipantId: 1,
};

// =============================================
// SEED MOCK DATA
// =============================================
async function seedMockDB() {
  // --- Seed Users (passwords are all "password123") ---
  const hash = await bcrypt.hash('password123', 10);
  mockDB.users = [
    {
      id: 1, full_name: 'Minh Host', username: 'minh.host', email: 'minh.host@example.com',
      password_hash: hash, role: 'host', gender: 'male',
      phone: '0912345678', skill_level: 'Khá/Tốt',
      city: 'Hà Nội', avatar_color: '#00F5C4', is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 2, full_name: 'Long Pro', username: 'long.pro', email: 'long.pro@example.com',
      password_hash: hash, role: 'host', gender: 'male',
      phone: '0987654321', skill_level: 'Khá/Tốt',
      city: 'Hà Nội', avatar_color: '#AAFF00', is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 3, full_name: 'Nguyễn Thị Mai', username: 'mai.player', email: 'mai.player@example.com',
      password_hash: hash, role: 'player', gender: 'female',
      phone: '0901112233', skill_level: 'Trung bình',
      city: 'Hà Nội', avatar_color: '#EC4899', is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 4, full_name: 'Nam Sài Gòn', username: 'nam.sgn', email: 'nam.sgn@example.com',
      password_hash: hash, role: 'host', gender: 'male',
      phone: '0977665544', skill_level: 'Khá/Tốt',
      city: 'TP.HCM', avatar_color: '#7C3AED', is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 5, full_name: 'Trần Thị Lan', username: 'lan.player', email: 'lan.player@example.com',
      password_hash: hash, role: 'player', gender: 'female',
      phone: '0944556677', skill_level: 'Mới chơi',
      city: 'TP.HCM', avatar_color: '#F97316', is_active: true,
      created_at: new Date().toISOString(),
    },
  ];
  mockDB.nextUserId = 6;

  // --- Seed Matches ---
  const today = new Date();
  const fmt = (d) => { const n = new Date(today); n.setDate(today.getDate() + d); return n.toISOString().split('T')[0]; };

  mockDB.matches = [
    { id: 1, title: 'Kèo Sáng Sớm Ba Đình - Trung Bình', host_name: 'Minh Host', host_phone: '0912345678', host_id: 1, court_id: 1, court_name: 'Sân Cầu Lông Viettel', district: 'Ba Đình', city: 'Hà Nội', play_date: fmt(1), start_time: '06:00', end_time: '08:00', max_slots: 8, cost_per_slot: 60000, shuttlecock: 'Ba Sao', skill_level: 'Trung bình', note: 'Đánh nhẹ nhàng, thân thiện. Cọc 50k qua chuyển khoản.', bank_name: 'VCB', bank_account: '1234567890', bank_owner: 'NGUYEN VAN MINH', status: 'open', created_at: new Date().toISOString() },
    { id: 2, title: 'Kèo Chiều Đống Đa - Khá/Tốt - Cần Thêm 2 Người!', host_name: 'Long Pro', host_phone: '0987654321', host_id: 2, court_id: 2, court_name: 'Sân Cầu Lông Khâm Thiên', district: 'Đống Đa', city: 'Hà Nội', play_date: fmt(1), start_time: '17:00', end_time: '19:00', max_slots: 6, cost_per_slot: 80000, shuttlecock: 'Hải Yến', skill_level: 'Khá/Tốt', note: 'Kèo dành cho người đã có nền tảng. Cọc 60k.', bank_name: 'MB Bank', bank_account: '9876543210', bank_owner: 'TRAN VAN LONG', status: 'open', created_at: new Date().toISOString() },
    { id: 3, title: 'Kèo Tối Thứ 7 Cầu Giấy - Tất cả Trình Độ', host_name: 'Minh Host', host_phone: '0912345678', host_id: 1, court_id: 3, court_name: 'Sân Cầu Lông Cầu Giấy Sport', district: 'Cầu Giấy', city: 'Hà Nội', play_date: fmt(2), start_time: '19:30', end_time: '21:30', max_slots: 10, cost_per_slot: 70000, shuttlecock: 'Thành Công', skill_level: 'Tất cả trình độ', note: 'Kèo mở cho mọi trình độ. Cọc 50k.', bank_name: 'Techcombank', bank_account: '5544332211', bank_owner: 'LE HUNG', status: 'open', created_at: new Date().toISOString() },
    { id: 4, title: 'Kèo Cuối Tuần Long Biên - Trung Bình', host_name: 'Minh Host', host_phone: '0912345678', host_id: 1, court_id: 4, court_name: 'Sân Cầu Lông Long Biên Arena', district: 'Long Biên', city: 'Hà Nội', play_date: fmt(3), start_time: '07:00', end_time: '09:00', max_slots: 8, cost_per_slot: 55000, shuttlecock: 'Ba Sao', skill_level: 'Trung bình', note: 'Đánh theo cặp, xoay vòng vui vẻ. Cọc 40k.', bank_name: 'ACB', bank_account: '6677889900', bank_owner: 'NGUYEN VAN TUAN', status: 'open', created_at: new Date().toISOString() },
    { id: 5, title: 'Kèo TP.HCM - Kỳ Hòa Quận 1 - Sáng Chủ Nhật', host_name: 'Nam Sài Gòn', host_phone: '0977665544', host_id: 4, court_id: 5, court_name: 'Sân Kỳ Hòa', district: 'Quận 1', city: 'TP.HCM', play_date: fmt(2), start_time: '08:00', end_time: '10:30', max_slots: 12, cost_per_slot: 90000, shuttlecock: 'Hải Yến', skill_level: 'Khá/Tốt', note: 'Sân xịn Quận 1, đánh nghiêm túc. Cọc 70k.', bank_name: 'VCB', bank_account: '1122334455', bank_owner: 'TRAN NAM', status: 'open', created_at: new Date().toISOString() },
    { id: 6, title: 'Kèo HCM - Celadon Thủ Đức - Chiều Thứ 6', host_name: 'Nam Sài Gòn', host_phone: '0977665544', host_id: 4, court_id: 6, court_name: 'Sân Cầu Lông Celadon City', district: 'Thủ Đức', city: 'TP.HCM', play_date: fmt(1), start_time: '16:00', end_time: '18:00', max_slots: 8, cost_per_slot: 65000, shuttlecock: 'Ba Sao', skill_level: 'Mới chơi', note: 'Kèo vui vẻ, không áp lực.', bank_name: 'MB Bank', bank_account: '3344556677', bank_owner: 'NGUYEN HUNG', status: 'open', created_at: new Date().toISOString() },
    { id: 7, title: 'Kèo Đà Nẵng - Hải Châu - Tối Thứ 4', host_name: 'Phong Đà Nẵng', host_phone: '0922334455', host_id: null, court_id: 7, court_name: 'Sân Cầu Lông Hoàng Long', district: 'Hải Châu', city: 'Đà Nẵng', play_date: fmt(1), start_time: '19:00', end_time: '21:00', max_slots: 8, cost_per_slot: 60000, shuttlecock: 'Ba Sao', skill_level: 'Trung bình', note: 'Kèo thường xuyên mỗi thứ 4, chào đón người mới!', bank_name: 'VietinBank', bank_account: '8899001122', bank_owner: 'LE VAN PHONG', status: 'open', created_at: new Date().toISOString() },
    { id: 8, title: 'Kèo Hà Nội Ba Đình - Tối Thứ 3 - ĐÃ ĐỦ NGƯỜI', host_name: 'Minh Host', host_phone: '0912345678', host_id: 1, court_id: 1, court_name: 'Sân Cầu Lông Viettel', district: 'Ba Đình', city: 'Hà Nội', play_date: fmt(1), start_time: '20:00', end_time: '22:00', max_slots: 6, cost_per_slot: 75000, shuttlecock: 'Hải Yến', skill_level: 'Khá/Tốt', note: 'Kèo đã đủ người chính thức. Vẫn có thể đăng ký dự bị.', bank_name: 'VCB', bank_account: '7788990011', bank_owner: 'PHAM VAN DUNG', status: 'open', created_at: new Date().toISOString() },
  ];
  mockDB.nextMatchId = 9;

  mockDB.participants = [
    { id: 1, match_id: 1, player_name: 'Nguyễn Văn An',    player_phone: '0911111111', skill_level: 'Trung bình', status: 'confirmed', deposit_status: 'paid',    queue_order: 1, registered_at: new Date().toISOString() },
    { id: 2, match_id: 1, player_name: 'Trần Thị Bình',    player_phone: '0922222222', skill_level: 'Trung bình', status: 'confirmed', deposit_status: 'paid',    queue_order: 2, registered_at: new Date().toISOString() },
    { id: 3, match_id: 1, player_name: 'Lê Văn Cường',     player_phone: '0933333333', skill_level: 'Trung bình', status: 'confirmed', deposit_status: 'pending', queue_order: 3, registered_at: new Date().toISOString() },
    { id: 4, match_id: 1, player_name: 'Phạm Thị Dung',    player_phone: '0944444444', skill_level: 'Mới chơi',   status: 'confirmed', deposit_status: 'paid',    queue_order: 4, registered_at: new Date().toISOString() },
    { id: 5, match_id: 1, player_name: 'Hoàng Văn Em',     player_phone: '0955555555', skill_level: 'Trung bình', status: 'confirmed', deposit_status: 'pending', queue_order: 5, registered_at: new Date().toISOString() },
    { id: 6, match_id: 2, player_name: 'Vũ Thị Phương',    player_phone: '0966666666', skill_level: 'Khá/Tốt',   status: 'confirmed', deposit_status: 'paid',    queue_order: 1, registered_at: new Date().toISOString() },
    { id: 7, match_id: 2, player_name: 'Đặng Văn Quang',   player_phone: '0977777777', skill_level: 'Khá/Tốt',   status: 'confirmed', deposit_status: 'paid',    queue_order: 2, registered_at: new Date().toISOString() },
    { id: 8, match_id: 2, player_name: 'Bùi Thị Hoa',      player_phone: '0988888888', skill_level: 'Khá/Tốt',   status: 'confirmed', deposit_status: 'paid',    queue_order: 3, registered_at: new Date().toISOString() },
    { id: 9, match_id: 2, player_name: 'Đỗ Văn Hùng',      player_phone: '0999999999', skill_level: 'Khá/Tốt',   status: 'confirmed', deposit_status: 'pending', queue_order: 4, registered_at: new Date().toISOString() },
    { id:10, match_id: 8, player_name: 'Nguyễn Minh Tuấn', player_phone: '0911221133', skill_level: 'Khá/Tốt',   status: 'confirmed', deposit_status: 'paid',    queue_order: 1, registered_at: new Date().toISOString() },
    { id:11, match_id: 8, player_name: 'Lê Thành Nam',      player_phone: '0922332244', skill_level: 'Khá/Tốt',   status: 'confirmed', deposit_status: 'paid',    queue_order: 2, registered_at: new Date().toISOString() },
    { id:12, match_id: 8, player_name: 'Trần Đức Anh',      player_phone: '0933443355', skill_level: 'Khá/Tốt',   status: 'confirmed', deposit_status: 'paid',    queue_order: 3, registered_at: new Date().toISOString() },
    { id:13, match_id: 8, player_name: 'Phạm Văn Hải',      player_phone: '0944554466', skill_level: 'Khá/Tốt',   status: 'confirmed', deposit_status: 'paid',    queue_order: 4, registered_at: new Date().toISOString() },
    { id:14, match_id: 8, player_name: 'Hoàng Trung Kiên',  player_phone: '0955665577', skill_level: 'Khá/Tốt',   status: 'confirmed', deposit_status: 'paid',    queue_order: 5, registered_at: new Date().toISOString() },
    { id:15, match_id: 8, player_name: 'Vũ Quốc Bảo',       player_phone: '0966776688', skill_level: 'Khá/Tốt',   status: 'confirmed', deposit_status: 'pending', queue_order: 6, registered_at: new Date().toISOString() },
    { id:16, match_id: 8, player_name: 'Đỗ Huy Hoàng',      player_phone: '0977887799', skill_level: 'Khá/Tốt',   status: 'waitlist',  deposit_status: 'pending', queue_order: 7, registered_at: new Date().toISOString() },
    { id:17, match_id: 8, player_name: 'Bùi Thanh Long',     player_phone: '0988998800', skill_level: 'Trung bình', status: 'waitlist',  deposit_status: 'pending', queue_order: 8, registered_at: new Date().toISOString() },
  ];
  mockDB.nextParticipantId = 18;
}

await seedMockDB();

// =============================================
// USER CRUD (Mock)
// =============================================
function findUserByEmail(term) {
  if (!term) return null;
  const target = term.toString().toLowerCase();
  return mockDB.users.find(u =>
    (u.username && u.username.toLowerCase() === target) ||
    (u.email && u.email.toLowerCase() === target)
  ) || null;
}

function findUserById(id) {
  return mockDB.users.find(u => u.id === parseInt(id)) || null;
}

function createUser(data) {
  const username = data.username || data.email || '';
  const email = data.email || username;
  const user = {
    id: mockDB.nextUserId++,
    full_name:     data.full_name || username,
    username:      username,
    email:         email,
    password_hash: data.password_hash,
    role:          data.role || 'player',
    gender:        data.gender || 'male',
    phone:         data.phone || '',
    skill_level:   data.skill_level || '',
    city:          data.city || '',
    avatar_color:  data.avatar_color || '#00F5C4',
    is_active:     true,
    created_at:    new Date().toISOString(),
  };
  mockDB.users.push(user);
  return user;
}

// =============================================
// MATCH CRUD (Mock)
// =============================================
function getMatchesWithCount(filters = {}) {
  if (!useMock) return null;
  let results = mockDB.matches.filter(m => m.status !== 'cancelled');
  if (filters.city)        results = results.filter(m => m.city        === filters.city);
  if (filters.district)    results = results.filter(m => m.district    === filters.district);
  if (filters.skill_level) results = results.filter(m => m.skill_level === filters.skill_level);
  return results.map(m => {
    const pList     = mockDB.participants.filter(p => p.match_id === m.id && p.status !== 'cancelled');
    const confirmed = pList.filter(p => p.status === 'confirmed').length;
    const waitlist  = pList.filter(p => p.status === 'waitlist').length;
    return { ...m, confirmed_count: confirmed, waitlist_count: waitlist };
  });
}

function getMatchById(id) {
  if (!useMock) return null;
  return mockDB.matches.find(m => m.id === parseInt(id)) || null;
}

function getParticipantsByMatchId(matchId) {
  if (!useMock) return null;
  return mockDB.participants
    .filter(p => p.match_id === parseInt(matchId) && p.status !== 'cancelled')
    .sort((a, b) => a.queue_order - b.queue_order);
}

function addParticipant(matchId, data) {
  if (!useMock) return null;
  const match = getMatchById(matchId);
  if (!match) return { error: 'Match not found', status: 404 };
  const confirmed  = mockDB.participants.filter(p => p.match_id === parseInt(matchId) && p.status === 'confirmed').length;
  const allActive  = mockDB.participants.filter(p => p.match_id === parseInt(matchId) && p.status !== 'cancelled');
  const isWaitlist = confirmed >= match.max_slots;
  const queueOrder = allActive.length + 1;
  const participant = {
    id:             mockDB.nextParticipantId++,
    match_id:       parseInt(matchId),
    player_name:    data.player_name,
    player_phone:   data.player_phone,
    skill_level:    data.skill_level || match.skill_level,
    status:         isWaitlist ? 'waitlist' : 'confirmed',
    deposit_status: 'pending',
    queue_order:    queueOrder,
    note:           data.note || '',
    registered_at:  new Date().toISOString(),
  };
  mockDB.participants.push(participant);
  return participant;
}

function cancelParticipant(participantId) {
  if (!useMock) return null;
  const p = mockDB.participants.find(p => p.id === parseInt(participantId));
  if (!p) return { error: 'Participant not found', status: 404 };
  const wasConfirmed = p.status === 'confirmed';
  p.status     = 'cancelled';
  p.updated_at = new Date().toISOString();
  if (wasConfirmed) {
    const match   = getMatchById(p.match_id);
    const confirmed = mockDB.participants.filter(pp => pp.match_id === p.match_id && pp.status === 'confirmed').length;
    if (confirmed < match.max_slots) {
      const top = mockDB.participants
        .filter(pp => pp.match_id === p.match_id && pp.status === 'waitlist')
        .sort((a, b) => a.queue_order - b.queue_order)[0];
      if (top) {
        top.status     = 'confirmed';
        top.updated_at = new Date().toISOString();
        return { cancelled: p, promoted: top };
      }
    }
  }
  return { cancelled: p, promoted: null };
}

function updateDepositStatus(participantId, status) {
  if (!useMock) return null;
  const p = mockDB.participants.find(p => p.id === parseInt(participantId));
  if (!p) return { error: 'Participant not found', status: 404 };
  p.deposit_status = status;
  p.updated_at     = new Date().toISOString();
  return p;
}

function addMatch(data) {
  if (!useMock) return null;
  const match = {
    id: mockDB.nextMatchId++,
    ...data,
    status:     'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockDB.matches.push(match);
  return match;
}

function getCourts() {
  if (!useMock) return null;
  return mockDB.courts;
}

export {
  pool,
  useMock,
  findUserByEmail,
  findUserById,
  createUser,
  getMatchesWithCount,
  getMatchById,
  getParticipantsByMatchId,
  addParticipant,
  cancelParticipant,
  updateDepositStatus,
  addMatch,
  getCourts,
};
