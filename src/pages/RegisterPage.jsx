// src/pages/RegisterPage.jsx - Split-screen layout with Navy Blue theme
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import badmintonHero from '../assets/badminton_hero.png';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    password: '',
    confirm_password: '',
    role: 'player',
    gender: 'male',
  });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.username.trim())    { setError('Tên đăng nhập không được để trống'); return; }
    if (form.password.length < 6) { setError('Mật khẩu phải từ 6 ký tự trở lên'); return; }
    if (form.password !== form.confirm_password) { setError('Mật khẩu xác nhận không khớp'); return; }
    setLoading(true);
    try {
      await register({
        username: form.username.trim(),
        full_name: form.full_name.trim() || form.username.trim(),
        password: form.password,
        role: form.role,
        gender: form.gender,
      });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reg2-page">

      {/* ── LEFT panel: full image background ── */}
      <div className="reg2-left">
        <img src={badmintonHero} alt="" className="reg2-left-img" />
        <div className="reg2-left-overlay">
          <Link to="/" className="reg2-brand">
            🏸 EasyFind
          </Link>
          <div className="reg2-left-text">
            <h2>Tìm kèo.<br/>Đặt chỗ.<br/>Giao lưu.</h2>
            <p>Cộng đồng cầu lông thế hệ mới — nhanh hơn, thông minh hơn.</p>
          </div>
          <div className="reg2-left-dots">
            <span className="reg2-dot reg2-dot--active" />
            <span className="reg2-dot" />
            <span className="reg2-dot" />
          </div>
        </div>
      </div>

      {/* ── RIGHT panel: form ── */}
      <div className="reg2-right">
        <div className="reg2-form-card">

          <div className="reg2-form-top">
            <h1 className="reg2-title">Tạo tài khoản</h1>
            <p className="reg2-subtitle">Miễn phí. Chọn đúng vai trò của bạn.</p>
          </div>

          {error && (
            <div className="reg2-error">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="reg2-form">

            {/* Role Selection */}
            <div className="reg2-field">
              <label className="reg2-label">Bạn tham gia với vai trò gì?</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div
                  onClick={() => set('role', 'player')}
                  style={{
                    padding: '12px 10px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    border: form.role === 'player' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    background: form.role === 'player' ? 'rgba(30, 58, 138, 0.08)' : 'var(--bg-surface)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: form.role === 'player' ? 'var(--accent-primary)' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    🏸 Người chơi
                  </div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Tìm kèo & đặt slot tham gia
                  </div>
                </div>

                <div
                  onClick={() => set('role', 'host')}
                  style={{
                    padding: '12px 10px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    border: form.role === 'host' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    background: form.role === 'host' ? 'rgba(30, 58, 138, 0.08)' : 'var(--bg-surface)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: form.role === 'host' ? 'var(--accent-primary)' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    🏆 Host (Tạo kèo)
                  </div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Tạo & quản lý kèo cầu lông
                  </div>
                </div>
              </div>
            </div>

            {/* Full Name & Username */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="reg2-field">
                <label className="reg2-label">Họ và tên</label>
                <div className="reg2-input-wrap">
                  <input
                    type="text"
                    className="reg2-input"
                    placeholder="Nguyễn Văn A"
                    value={form.full_name}
                    onChange={e => set('full_name', e.target.value)}
                  />
                </div>
              </div>

              <div className="reg2-field">
                <label className="reg2-label">Giới tính</label>
                <select
                  className="reg2-input"
                  style={{ cursor: 'pointer' }}
                  value={form.gender}
                  onChange={e => set('gender', e.target.value)}
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>

            <div className="reg2-field">
              <label className="reg2-label">Tên đăng nhập *</label>
              <div className="reg2-input-wrap">
                <svg className="reg2-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="8" r="4"/>
                </svg>
                <input
                  type="text"
                  className="reg2-input"
                  placeholder="vd: nguyen_van_a"
                  required
                  value={form.username}
                  onChange={e => set('username', e.target.value)}
                />
              </div>
            </div>

            <div className="reg2-field">
              <label className="reg2-label">Mật khẩu *</label>
              <div className="reg2-input-wrap">
                <svg className="reg2-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type="password"
                  className="reg2-input"
                  placeholder="Ít nhất 6 ký tự"
                  required
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                />
              </div>
            </div>

            <div className="reg2-field">
              <label className="reg2-label">Xác nhận mật khẩu *</label>
              <div className="reg2-input-wrap">
                <svg className="reg2-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <input
                  type="password"
                  className="reg2-input"
                  placeholder="Nhập lại mật khẩu"
                  required
                  value={form.confirm_password}
                  onChange={e => set('confirm_password', e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="reg2-btn" disabled={loading}>
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký ngay →'}
            </button>

          </form>

          <div className="reg2-divider"><span>hoặc</span></div>

          <p className="reg2-switch">
            Đã có tài khoản? <Link to="/login" className="reg2-link">Đăng nhập</Link>
          </p>

          <Link to="/" className="reg2-back">← Về trang chủ</Link>

        </div>
      </div>

    </div>
  );
}
