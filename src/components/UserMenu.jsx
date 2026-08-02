// src/components/UserMenu.jsx - Clean dropdown with Host verification & My Matches
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { avatarColor, avatarInitials, SKILL_LEVELS, CITIES } from '../utils/helpers';

const GENDER_LABELS = { male: 'Nam', female: 'Nữ', other: 'Khác' };
const ROLE_LABELS = { host: 'Host', player: 'Player' };

export default function UserMenu() {
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
 const isHost = user.role === 'host';

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

     <div className="user-dropdown-divider" />
     <button
       id="btn-logout"
       className="user-dropdown-item user-dropdown-item--danger"
       onClick={() => { logout(); setOpen(false); }}
     >
       Đăng xuất
     </button>
   </div>
 )}
 </div>

 {/* Các Modal bật lên */}
 {showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}
 {showMyMatches && <MyMatchesModal onClose={() => setShowMyMatches(false)} />}
 </>
 );
}

/* ── Modal Hồ sơ (Tùy biến riêng cho Host để chống scam) ── */
function ProfilePanel({ onClose }) {
 const { user, updateProfile } = useAuth();
 const isHost = user?.role === 'host';

 const [form, setForm] = useState({
   full_name: user?.full_name || '',
   phone: user?.phone || '',
   skill_level: user?.skill_level || '',
   city: user?.city || '',
   gender: user?.gender || '',
   // Trường mở rộng chống scam cho Host
   cccd: user?.cccd || '',
   district: user?.district || '',
   social_link: user?.social_link || '',
 });
 const [saving, setSaving] = useState(false);
 const [msg, setMsg] = useState(null);

 async function handleSave(e) {
   e.preventDefault();
   setSaving(true); setMsg(null);
   try {
     await updateProfile(form);
     setMsg({ type: 'success', text: 'Đã cập nhật hồ sơ thành công!' });
   } catch (err) {
     setMsg({ type: 'error', text: err.message });
   } finally {
     setSaving(false);
   }
 }

 const [bg, textCol] = avatarColor(user?.full_name || '');

 return (
 <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
   <div className="modal-box" style={{ maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
     <div className="modal-header">
       <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Hồ sơ {isHost ? 'Host (Xác thực)' : 'Người chơi'}</h2>
       <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
     </div>
     <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
       
       {/* Avatar & info */}
       <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, background: 'var(--bg-subtle)', borderRadius: 8 }}>
         <div className="user-avatar" style={{ width: 48, height: 48, background: bg, color: textCol, fontSize: '1rem' }}>
           {avatarInitials(user?.full_name || '')}
         </div>
         <div>
           <div style={{ fontWeight: 700 }}>{user?.full_name}</div>
           <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
             @{user?.username} · {ROLE_LABELS[user?.role]}
           </div>
         </div>
       </div>

       {msg && (
         <div style={{
           padding: '10px 14px', fontSize: '0.85rem',
           background: msg.type === 'success' ? 'rgba(5,150,105,0.08)' : 'rgba(225,29,72,0.08)',
           color: msg.type === 'success' ? 'var(--accent-mint)' : 'var(--accent-primary)',
           border: `1px solid ${msg.type === 'success' ? 'rgba(5,150,105,0.2)' : 'rgba(225,29,72,0.2)'}`,
         }}>
           {msg.text}
         </div>
       )}

       <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
         {/* Giới tính */}
         <div className="form-group">
           <label className="form-label">Giới tính</label>
           <div style={{ display: 'flex', gap: 8 }}>
             {[
               { value: 'male', label: 'Nam' },
               { value: 'female', label: 'Nữ' },
               { value: 'other', label: 'Khác' },
             ].map(g => (
               <button
                 type="button"
                 key={g.value}
                 onClick={() => setForm(f => ({ ...f, gender: g.value }))}
                 className={`filter-chip${form.gender === g.value ? ' filter-chip--active' : ''}`}
                 style={{ flex: 1, padding: '8px 0' }}
               >
                 {g.label}
               </button>
             ))}
           </div>
         </div>

         <div className="grid-2">
           <div className="form-group">
             <label className="form-label">Họ & Tên</label>
             <input className="form-input" value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))} />
           </div>
           <div className="form-group">
             <label className="form-label">Số điện thoại</label>
             <input className="form-input" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
           </div>
         </div>

         {/* TRƯỜNG THÔNG TIN BỔ SUNG RIÊNG CHO HOST (CHỐNG SCAM) */}
         {isHost && (
           <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8, border: '1px solid #dadce0', display: 'flex', flexDirection: 'column', gap: 12 }}>
             <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1a73e8' }}>
               🛡️ THÔNG TIN XÁC THỰC HOST
             </div>
             <div className="grid-2">
               <div className="form-group">
                 <label className="form-label">Số CCCD / CMND</label>
                 <input className="form-input" placeholder="Nhập 12 số CCCD" value={form.cccd} onChange={e => setForm(f => ({...f, cccd: e.target.value}))} />
               </div>
               <div className="form-group">
                 <label className="form-label">Khu vực hoạt động</label>
                 <input className="form-input" placeholder="VD: Quận Cầu Giấy" value={form.district} onChange={e => setForm(f => ({...f, district: e.target.value}))} />
               </div>
             </div>
             <div className="form-group">
               <label className="form-label">Link Facebook / Zalo cá nhân</label>
               <input className="form-input" placeholder="https://facebook.com/..." value={form.social_link} onChange={e => setForm(f => ({...f, social_link: e.target.value}))} />
             </div>
           </div>
         )}

         {!isHost && (
           <div className="grid-2">
             <div className="form-group">
               <label className="form-label">Trình độ</label>
               <select className="form-select" value={form.skill_level} onChange={e => setForm(f => ({...f, skill_level: e.target.value}))}>
                 <option value="">-- Chọn --</option>
                 {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             </div>
             <div className="form-group">
               <label className="form-label">Thành phố</label>
               <select className="form-select" value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))}>
                 {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
             </div>
           </div>
         )}

         <button type="submit" className="btn btn-primary" disabled={saving}>
           {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
         </button>
       </form>
     </div>
   </div>
 </div>
 );
}

/* ── Modal Quản lý Kèo của tôi (Dành cho Host xem lịch sử tạo kèo) ── */
function MyMatchesModal({ onClose }) {
  // Dữ liệu mẫu giả lập các kèo Host đã tạo (Sau này bạn kết nối API lấy từ database của host)
  const [matches] = useState([
    { id: 1, title: 'Kèo giao lưu tối thứ 4', court: 'Sân Cầu lông Thành Công', time: '19:00 - 21:00, 02/08/2026', status: 'Đang mở' },
    { id: 2, title: 'Kèo trình độ trung bình', court: 'Sân Bách Khoa', time: '18:00 - 20:00, 28/07/2026', status: 'Đã hoàn thành' },
  ]);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 520, maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Kèo của tôi đã tạo</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Danh sách các trận đấu bạn đã tổ chức giúp người chơi đối soát mức độ uy tín:
          </div>

          {matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
              Bạn chưa tạo kèo đấu nào.
            </div>
          ) : (
            matches.map(m => (
              <div key={m.id} style={{
                padding: 12, borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-subtle)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>📍 {m.court}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>⏰ {m.time}</div>
                </div>
                <div>
                  <span style={{
                    padding: '4px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 600,
                    background: m.status === 'Đang mở' ? 'rgba(5,150,105,0.1)' : 'rgba(100,116,139,0.1)',
                    color: m.status === 'Đang mở' ? '#059669' : '#64748b'
                  }}>
                    {m.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
