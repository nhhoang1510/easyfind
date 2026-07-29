// src/components/UserMenu.jsx - Avatar dropdown + profile panel
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { avatarColor, avatarInitials, SKILL_LEVELS, CITIES } from '../utils/helpers';

const GENDER_LABELS = { male: '👨 Nam', female: '👩 Nữ', other: '🧑 Khác' };
const ROLE_LABELS   = { host: '🏠 Người Tổ Chức', player: '🏸 Người Chơi' };

export default function UserMenu() {
  const { user, logout, updateProfile } = useAuth();
  const [open, setOpen]             = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  if (!user) return null;

  const [bg, textCol] = avatarColor(user.full_name);
  const initials      = avatarInitials(user.full_name);

  return (
    <>
      <div ref={ref} style={{ position: 'relative' }}>
        {/* Avatar button */}
        <button
          id="user-avatar-btn"
          onClick={() => setOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: open ? 'rgba(0,245,196,0.08)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${open ? 'rgba(0,245,196,0.3)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 100, padding: '4px 12px 4px 4px',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: bg, color: textCol,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.78rem', flexShrink: 0,
          }}>{initials}</div>
          <div style={{ textAlign: 'left', lineHeight: 1.2 }} className="hide-mobile">
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#F0F6FF', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.full_name}</div>
            <div style={{ fontSize: '0.68rem', color: user.role === 'host' ? '#AAFF00' : '#00F5C4' }}>
              {user.role === 'host' ? '🏠 Host' : '🏸 Player'}
            </div>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9DB4CC" strokeWidth="2" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : '' }} className="hide-mobile">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 220,
            background: '#162035', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14, boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
            animation: 'slideUp 0.15s ease', zIndex: 300, overflow: 'hidden',
          }}>
            {/* User info header */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: bg, color: textCol, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: '#F0F6FF', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.full_name}</div>
                <div style={{ fontSize: '0.72rem', color: '#5B7A99', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.68rem', padding: '1px 7px', borderRadius: 100, background: user.role === 'host' ? 'rgba(170,255,0,0.12)' : 'rgba(0,245,196,0.12)', color: user.role === 'host' ? '#AAFF00' : '#00F5C4', border: `1px solid ${user.role === 'host' ? 'rgba(170,255,0,0.2)' : 'rgba(0,245,196,0.2)'}` }}>
                    {ROLE_LABELS[user.role]}
                  </span>
                  {user.gender && (
                    <span style={{ fontSize: '0.68rem', padding: '1px 7px', borderRadius: 100, background: 'rgba(255,255,255,0.06)', color: '#9DB4CC' }}>
                      {GENDER_LABELS[user.gender]}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Menu items */}
            {[
              { icon: '👤', label: 'Hồ Sơ Của Tôi',  action: () => { setOpen(false); setShowProfile(true); } },
              { icon: '📋', label: 'Kèo Của Tôi',     action: () => setOpen(false) },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                style={{
                  width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10,
                  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  color: '#9DB4CC', fontSize: '0.85rem', fontWeight: 500, textAlign: 'left',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#F0F6FF'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9DB4CC'; }}
              >
                <span>{item.icon}</span> {item.label}
              </button>
            ))}

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
            <button
              id="btn-logout"
              onClick={() => { logout(); setOpen(false); }}
              style={{
                width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10,
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                color: '#EF4444', fontSize: '0.85rem', fontWeight: 500, textAlign: 'left',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Đăng Xuất
            </button>
          </div>
        )}
      </div>

      {/* Profile Edit Panel */}
      {showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}
    </>
  );
}

function ProfilePanel({ onClose }) {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    full_name:   user?.full_name || '',
    phone:       user?.phone     || '',
    skill_level: user?.skill_level || '',
    city:        user?.city      || '',
    gender:      user?.gender    || '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState(null);

  const GENDER_OPTIONS = [
    { value: 'male',   icon: '👨', label: 'Nam',  color: '#3B82F6' },
    { value: 'female', icon: '👩', label: 'Nữ',   color: '#EC4899' },
    { value: 'other',  icon: '🧑', label: 'Khác', color: '#8B5CF6' },
  ];

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      await updateProfile(form);
      setMsg({ type: 'success', text: '✅ Đã cập nhật hồ sơ thành công!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  const [bg, textCol] = avatarColor(user?.full_name || '');

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <h2 style={{ fontWeight: 800, fontSize: '1.1rem' }}>👤 Hồ Sơ Của Tôi</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Avatar & read-only info */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: bg, color: textCol, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0, boxShadow: `0 0 16px ${bg}50` }}>
              {avatarInitials(user?.full_name || '')}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#F0F6FF' }}>{user?.full_name}</div>
              <div style={{ fontSize: '0.78rem', color: '#5B7A99' }}>{user?.email}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 100, background: user?.role === 'host' ? 'rgba(170,255,0,0.12)' : 'rgba(0,245,196,0.12)', color: user?.role === 'host' ? '#AAFF00' : '#00F5C4' }}>
                  {user?.role === 'host' ? '🏠 Host' : '🏸 Player'}
                </span>
                {user?.gender && <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 100, background: 'rgba(255,255,255,0.06)', color: '#9DB4CC' }}>{GENDER_LABELS[user.gender]}</span>}
              </div>
            </div>
          </div>

          {msg && (
            <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: '0.85rem', background: msg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: msg.type === 'success' ? '#22C55E' : '#EF4444', border: `1px solid ${msg.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Giới tính</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {GENDER_OPTIONS.map(g => (
                  <div key={g.value} onClick={() => setForm(f => ({ ...f, gender: g.value }))}
                    style={{ flex: 1, padding: '10px 6px', borderRadius: 10, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', border: form.gender === g.value ? `2px solid ${g.color}` : '1px solid rgba(255,255,255,0.08)', background: form.gender === g.value ? `${g.color}18` : 'rgba(255,255,255,0.03)' }}>
                    <div style={{ fontSize: '1.3rem', marginBottom: 2 }}>{g.icon}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: form.gender === g.value ? g.color : '#9DB4CC' }}>{g.label}</div>
                  </div>
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

            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }} disabled={saving}>
              {saving ? '⏳ Đang lưu...' : '💾 Lưu Thay Đổi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
