// src/components/AuthModal.jsx - Single Username Auth Modal (No Email/Phone required)
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SKILL_LEVELS, CITIES } from '../utils/helpers';

const GENDER_OPTIONS = [
  { value: 'male',   label: 'NAM' },
  { value: 'female', label: 'NỮ' },
  { value: 'other',  label: 'KHÁC' },
];

const ROLE_OPTIONS = [
  { value: 'player', label: 'NGƯỜI CHƠI (PLAYER)', desc: 'Tìm kèo, đăng ký slot, tham gia cộng đồng' },
  { value: 'host',   label: 'NGƯỜI TỔ CHỨC (HOST)',  desc: 'Tạo kèo, quản lý danh sách, duyệt cọc tiền' },
];

export default function AuthModal({ onClose, defaultTab = 'login' }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [regForm, setRegForm] = useState({
    full_name: '', username: '', password: '', confirm_password: '',
    role: 'player', gender: 'male', skill_level: 'Trung bình', city: 'Hà Nội',
  });

  function setReg(k, v) { setRegForm(f => ({ ...f, [k]: v })); }

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(loginForm.username, loginForm.password);
      setSuccess(`Chào mừng trở lại, ${user.full_name}!`);
      setTimeout(onClose, 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    if (!regForm.username.trim()) { setError('Vui lòng nhập tên đăng nhập'); return; }
    if (!regForm.gender)          { setError('Vui lòng chọn giới tính'); return; }
    if (!regForm.role)            { setError('Vui lòng chọn vai trò');   return; }
    if (regForm.password !== regForm.confirm_password) { setError('Mật khẩu xác nhận không khớp'); return; }
    if (regForm.password.length < 6) { setError('Mật khẩu phải ít nhất 6 ký tự'); return; }
    setLoading(true);
    try {
      const { confirm_password, ...payload } = regForm;
      const user = await register(payload);
      setSuccess(`Đăng ký thành công! Chào mừng ${user.full_name}!`);
      setTimeout(onClose, 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 480 }}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '-0.2px' }}>
              {tab === 'login' ? 'ĐĂNG NHẬP TÀI KHOẢN' : 'TẠO TÀI KHOẢN MỚI'}
            </h2>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ fontSize: '1.2rem' }}>
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          {[
            { id: 'login',    label: 'ĐĂNG NHẬP' },
            { id: 'register', label: 'ĐĂNG KÝ' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setError(''); setSuccess(''); }}
              style={{
                flex: 1, padding: '12px 0', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: 700, fontSize: '0.82rem',
                background: tab === t.id ? '#FFFFFF' : 'transparent',
                color: tab === t.id ? '#E11D48' : '#64748B',
                borderBottom: tab === t.id ? '2px solid #E11D48' : '2px solid transparent',
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Error / Success messages */}
        {(error || success) && (
          <div style={{
            margin: '14px 24px 0', padding: '10px 14px', fontSize: '0.84rem',
            background: success ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${success ? '#BBF7D0' : '#FECACA'}`,
            color: success ? '#15803D' : '#B91C1C',
            fontWeight: 600,
          }}>
            {error || success}
          </div>
        )}

        <div className="modal-body">
          {tab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Tên đăng nhập</label>
                <input
                  type="text" className="form-input" required placeholder="Nhập tên đăng nhập của bạn"
                  value={loginForm.username} onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mật khẩu</label>
                <input
                  type="password" className="form-input" required placeholder="••••••••"
                  value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ justifyContent: 'center', marginTop: 4 }} disabled={loading}>
                {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
              </button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Role selection */}
              <div className="form-group">
                <label className="form-label">Vai trò tài khoản</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {ROLE_OPTIONS.map(r => (
                    <div
                      key={r.value}
                      onClick={() => setReg('role', r.value)}
                      style={{
                        padding: '12px 10px', cursor: 'pointer', textAlign: 'center',
                        border: regForm.role === r.value ? '2px solid #E11D48' : '1px solid #CBD5E1',
                        background: regForm.role === r.value ? '#FEF2F2' : '#FFFFFF',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: regForm.role === r.value ? '#E11D48' : '#0F172A' }}>{r.label}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 2 }}>{r.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender selection */}
              <div className="form-group">
                <label className="form-label">Giới tính</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {GENDER_OPTIONS.map(g => (
                    <div
                      key={g.value}
                      onClick={() => setReg('gender', g.value)}
                      style={{
                        flex: 1, padding: '10px 8px', cursor: 'pointer', textAlign: 'center',
                        border: regForm.gender === g.value ? '2px solid #E11D48' : '1px solid #CBD5E1',
                        background: regForm.gender === g.value ? '#FEF2F2' : '#FFFFFF',
                        fontWeight: 700, fontSize: '0.82rem',
                        color: regForm.gender === g.value ? '#E11D48' : '#334155',
                      }}
                    >
                      {g.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Họ & Tên</label>
                  <input className="form-input" required placeholder="Nguyễn Văn A" value={regForm.full_name} onChange={e => setReg('full_name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tên đăng nhập</label>
                  <input className="form-input" required placeholder="User123" value={regForm.username} onChange={e => setReg('username', e.target.value)} />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Mật khẩu</label>
                  <input type="password" className="form-input" required placeholder="Ít nhất 6 ký tự" value={regForm.password} onChange={e => setReg('password', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Xác nhận mật khẩu</label>
                  <input type="password" className="form-input" required placeholder="Nhập lại mật khẩu" value={regForm.confirm_password} onChange={e => setReg('confirm_password', e.target.value)} />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Trình độ</label>
                  <select className="form-select" value={regForm.skill_level} onChange={e => setReg('skill_level', e.target.value)}>
                    {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Thành phố</label>
                  <select className="form-select" value={regForm.city} onChange={e => setReg('city', e.target.value)}>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ justifyContent: 'center', marginTop: 4 }} disabled={loading}>
                {loading ? 'ĐANG XỬ LÝ...' : 'TẠO TÀI KHOẢN'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
