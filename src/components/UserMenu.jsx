// src/components/UserMenu.jsx - Clean dropdown with Host verification & My Matches
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { avatarColor, avatarInitials, SKILL_LEVELS, CITIES, formatZaloMatchPost, fmtDate, fmtTime } from '../utils/helpers';
import { api } from '../api/client';
import { MapPin, Calendar, Clock, Users, Copy, Check, UserCheck, PlusCircle } from 'lucide-react';

const GENDER_LABELS = { male: 'Nam', female: 'Nữ', other: 'Khác' };
const ROLE_LABELS = { host: 'Host', player: 'Player' };

export default function UserMenu({ onSelectMatch }) {
 const { user, logout } = useAuth();
 const [open, setOpen] = useState(false);
 const [showProfile, setShowProfile] = useState(false);
 const [showMyMatches, setShowMyMatches] = useState(false); // State mở modal Kèo của tôi
 const ref = useRef(null);

 useEffect(() => {
   function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
   document.addEventListener('mousedown', handle);
   return () => document.removeEventListener('mousedown', handle);
 }, []);

 if (!user) return null;

 const [bg, textCol] = avatarColor(user.full_name);
 const initials = avatarInitials(user.full_name);

 return (
 <>
 <div ref={ref} style={{ position: 'relative' }}>
 <button
   id="user-avatar-btn"
   onClick={() => setOpen(v => !v)}
   className="user-avatar-btn"
 >
   <div className="user-avatar" style={{ background: bg, color: textCol }}>
     {initials}
   </div>
   <span className="user-name hide-mobile">{user.full_name}</span>
 </button>

 {open && (
   <div className="user-dropdown">
     <div className="user-dropdown-header">
       <div className="user-avatar" style={{ background: bg, color: textCol, width: 36, height: 36 }}>
         {initials}
       </div>
       <div>
         <div className="user-dropdown-name">{user.full_name}</div>
         <div className="user-dropdown-role">
           @{user.username}
         </div>
       </div>
     </div>

     <button
       className="user-dropdown-item"
       onClick={() => { setOpen(false); setShowProfile(true); }}
     >
       Hồ sơ cá nhân
     </button>

     {/* Nút mở Kèo của tôi */}
     <button
       className="user-dropdown-item"
       onClick={() => { setOpen(false); setShowMyMatches(true); }}
     >
       Kèo của tôi
     </button>

     <div style={{ height: 1, background: 'var(--border-color)', margin: '4px 0' }} />

     <button
       className="user-dropdown-item user-dropdown-item--danger"
       onClick={() => { setOpen(false); logout(); }}
     >
       Đăng xuất
     </button>
   </div>
 )}
 </div>

 {/* Profile Modal */}
 {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

 {/* Modal Kèo của tôi */}
 {showMyMatches && <MyMatchesModal onClose={() => setShowMyMatches(false)} onSelectMatch={onSelectMatch} />}
 </>
 );
}

/* ── Modal Hồ sơ cá nhân (Edit Profile + Become Host) ── */
function ProfileModal({ onClose }) {
 const { user, updateUser } = useAuth();
 const [form, setForm] = useState({
   full_name:   user?.full_name   || '',
   phone:       user?.phone       || '',
   gender:      user?.gender      || 'male',
   skill_level: user?.skill_level || 'Trung bình',
   city:        user?.city        || 'Hà Nội',
   role:        user?.role        || 'player',
   bank_name:   user?.bank_name   || '',
   bank_account:user?.bank_account|| '',
   bank_owner:  user?.bank_owner  || '',
   cccd:        user?.cccd        || '',
   district:    user?.district    || '',
   social_link: user?.social_link || '',
 });
 const [saving, setSaving] = useState(false);
 const [msg, setMsg]       = useState(null);

 const isHost = form.role === 'host';

 async function handleSubmit(e) {
   e.preventDefault();
   setSaving(true); setMsg(null);
   try {
     const updated = await api.updateProfile(form);
     updateUser(updated);
     setMsg({ type: 'success', text: 'Cập nhật thông tin thành công!' });
     setTimeout(() => onClose(), 1200);
   } catch (err) {
     setMsg({ type: 'error', text: err.message });
   } finally {
     setSaving(false);
   }
 }

 return (
 <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
   <div className="modal-box" style={{ maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
     <div className="modal-header">
       <h2 style={{ fontWeight: 700, fontSize: '1.05rem' }}>Hồ sơ cá nhân</h2>
       <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
     </div>
     <div className="modal-body">
       {msg && (
         <div style={{
           padding: '8px 12px', borderRadius: 6, marginBottom: 16, fontSize: '0.84rem',
           background: msg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
           color: msg.type === 'success' ? '#15803D' : '#B91C1C',
           border: `1px solid ${msg.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
         }}>
           {msg.text}
         </div>
       )}

       <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
         {/* Role switcher */}
         <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8, border: '1px solid var(--border-color)' }}>
           <label className="form-label" style={{ marginBottom: 6 }}>Vai trò</label>
           <div style={{ display: 'flex', gap: 16 }}>
             <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
               <input type="radio" name="role" value="player" checked={form.role === 'player'} onChange={e => setForm(f => ({...f, role: e.target.value}))} />
               <span>Người chơi</span>
             </label>
             <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
               <input type="radio" name="role" value="host" checked={form.role === 'host'} onChange={e => setForm(f => ({...f, role: e.target.value}))} />
               <span>Người tổ chức</span>
             </label>
           </div>
         </div>

         <div className="form-group">
           <label className="form-label">Họ & Tên *</label>
           <input className="form-input" required value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))} />
         </div>

         <div className="grid-2">
           <div className="form-group">
             <label className="form-label">Số điện thoại *</label>
             <input className="form-input" required placeholder="0912345678" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
           </div>
           <div className="form-group">
             <label className="form-label">Giới tính</label>
             <select className="form-select" value={form.gender} onChange={e => setForm(f => ({...f, gender: e.target.value}))}>
               <option value="male">Nam</option>
               <option value="female">Nữ</option>
               <option value="other">Khác</option>
             </select>
           </div>
         </div>

         <button type="submit" className="btn btn-primary" disabled={saving}>
           {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
         </button>
       </form>
     </div>
   </div>
 </div>
 );
}

/* ── Modal Quản lý Kèo của tôi ── */
function MyMatchesModal({ onClose, onSelectMatch }) {
  const { user } = useAuth();
  const [tab, setTab] = useState('created'); // 'created' | 'registered'
  const [loading, setLoading] = useState(true);
  const [allMatches, setAllMatches] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.getMatches();
        const detailed = await Promise.all(
          data.map(m => api.getMatch(m.id).catch(() => m))
        );
        setAllMatches(detailed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const createdMatches = allMatches.filter(
    m => (user && m.host_id === user.id) || (user && m.host_name === user.full_name)
  );

  const registeredMatches = allMatches.filter(
    m => Array.isArray(m.participants) && m.participants.some(
      p => (user && p.user_id === user.id) || (user && p.player_phone && p.player_phone === user.phone) || (user && p.player_name === user.full_name)
    )
  );

  function handleCopyZalo(m, e) {
    e.stopPropagation();
    const text = formatZaloMatchPost(m);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(m.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  }

  const matchesToShow = tab === 'created' ? createdMatches : registeredMatches;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 560, maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>Kèo của tôi</h2>
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Quản lý kèo đấu bạn làm host hoặc đã đăng ký tham gia</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {/* Tab Header */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <button
            onClick={() => setTab('created')}
            style={{
              flex: 1, padding: '10px 12px', fontSize: '0.82rem', fontWeight: 700,
              border: 'none', borderBottom: tab === 'created' ? '2px solid var(--brand)' : '2px solid transparent',
              background: tab === 'created' ? '#FFFFFF' : 'transparent',
              color: tab === 'created' ? 'var(--brand)' : '#64748B', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}
          >
            <PlusCircle size={15} style={{ color: tab === 'created' ? 'var(--brand)' : '#64748B' }} />
            <span>ĐÃ TẠO ({createdMatches.length})</span>
          </button>
          <button
            onClick={() => setTab('registered')}
            style={{
              flex: 1, padding: '10px 12px', fontSize: '0.82rem', fontWeight: 700,
              border: 'none', borderBottom: tab === 'registered' ? '2px solid var(--brand)' : '2px solid transparent',
              background: tab === 'registered' ? '#FFFFFF' : 'transparent',
              color: tab === 'registered' ? 'var(--brand)' : '#64748B', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}
          >
            <UserCheck size={15} style={{ color: tab === 'registered' ? 'var(--brand)' : '#64748B' }} />
            <span>ĐÃ ĐĂNG KÝ ({registeredMatches.length})</span>
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748B' }}>Đang tải danh sách kèo...</div>
          ) : matchesToShow.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748B', background: '#F8FAFC', borderRadius: 8, border: '1px dashed #CBD5E1' }}>
              {tab === 'created' ? 'Bạn chưa tạo kèo đấu nào.' : 'Bạn chưa đăng ký tham gia kèo đấu nào.'}
            </div>
          ) : (
            matchesToShow.map(m => {
              const confirmedCount = m.confirmed_count || (m.participants ? m.participants.filter(p => p.status === 'confirmed').length : 0);
              const isCopied = copiedId === m.id;
              const myParticipant = Array.isArray(m.participants) ? m.participants.find(p => (user && p.user_id === user.id) || (user && p.player_phone && p.player_phone === user.phone) || (user && p.player_name === user.full_name)) : null;

              return (
                <div
                  key={m.id}
                  onClick={() => { onClose(); if (onSelectMatch) onSelectMatch(m); }}
                  style={{
                    padding: 14, borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFFFFF',
                    display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'border-color 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>{m.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={13} style={{ flexShrink: 0, color: 'var(--brand)' }} />
                        <span>{m.court_name || m.court} ({m.district})</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 4, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={13} style={{ flexShrink: 0, color: 'var(--brand)' }} />
                          <span>{fmtDate(m.play_date)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={13} style={{ flexShrink: 0, color: 'var(--brand)' }} />
                          <span>{fmtTime(m.start_time)} – {fmtTime(m.end_time)}</span>
                        </div>
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap',
                      background: m.status === 'open' || m.status === 'Đang mở' ? '#F0FDF4' : '#F1F5F9',
                      color: m.status === 'open' || m.status === 'Đang mở' ? '#15803D' : '#64748B',
                      border: `1px solid ${m.status === 'open' || m.status === 'Đang mở' ? '#BBF7D0' : '#E2E8F0'}`
                    }}>
                      {m.status === 'open' || m.status === 'Đang mở' ? 'Đang mở' : 'Đã đóng'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Users size={13} style={{ flexShrink: 0, color: 'var(--brand)' }} />
                      <span>Slots: <strong style={{ color: 'var(--brand)', fontWeight: 800 }}>{confirmedCount}</strong>/{m.max_slots} suất</span>
                      {myParticipant && (
                        <span style={{ marginLeft: 6, padding: '2px 8px', borderRadius: 4, background: myParticipant.status === 'confirmed' ? '#DCFCE7' : '#FEF3C7', color: myParticipant.status === 'confirmed' ? '#166534' : '#92400E', fontSize: '0.7rem', fontWeight: 700 }}>
                          {myParticipant.status === 'confirmed' ? '✓ Đã xác nhận' : '⏳ Dự bị'}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      {tab === 'created' && (
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={(e) => handleCopyZalo(m, e)}
                          style={{
                            background: isCopied ? '#059669' : '#0284C7', color: '#FFFFFF',
                            fontSize: '0.75rem', fontWeight: 700, padding: '5px 12px', borderRadius: 6, border: 'none',
                            display: 'flex', alignItems: 'center', gap: 5
                          }}
                        >
                          {isCopied ? (
                            <>
                              <Check size={13} />
                              <span>Đã copy Zalo!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span>Copy bài Zalo</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
