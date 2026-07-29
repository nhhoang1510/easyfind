// src/pages/RegisterPage.jsx — Premium redesign with animated stepper
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  { id: 'role',    label: 'Vai trò' },
  { id: 'info',    label: 'Thông tin' },
  { id: 'account', label: 'Tài khoản' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    password: '',
    confirm_password: '',
    role: '',
    gender: 'male',
  });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setError(''); }

  function nextStep() {
    if (step === 0 && !form.role) { setError('Hãy chọn vai trò để tiếp tục'); return; }
    if (step === 1) {
      if (!form.full_name.trim()) { setError('Vui lòng nhập họ và tên'); return; }
    }
    setStep(s => Math.min(s + 1, 2));
  }

  function prevStep() { setStep(s => Math.max(s - 1, 0)); setError(''); }

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
    <div className="rp">
      {/* ── Decorative background ── */}
      <div className="rp-bg">
        <div className="rp-bg-orb rp-bg-orb--1" />
        <div className="rp-bg-orb rp-bg-orb--2" />
        <div className="rp-bg-orb rp-bg-orb--3" />
      </div>

      {/* ── Top nav ── */}
      <nav className="rp-nav">
        <Link to="/" className="rp-nav-brand">🏸 EasyFind</Link>
        <Link to="/login" className="rp-nav-login">Đã có tài khoản? <strong>Đăng nhập</strong></Link>
      </nav>

      {/* ── Card ── */}
      <div className="rp-card">
        {/* Stepper */}
        <div className="rp-stepper">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`rp-step ${i <= step ? 'rp-step--active' : ''} ${i < step ? 'rp-step--done' : ''}`}>
              <div className="rp-step-num">
                {i < step ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className="rp-step-label">{s.label}</span>
              {i < STEPS.length - 1 && <div className={`rp-step-line ${i < step ? 'rp-step-line--done' : ''}`} />}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="rp-alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* ── Step 0: Role ── */}
        {step === 0 && (
          <div className="rp-step-panel">
            <div className="rp-panel-head">
              <h1>Chào mừng đến EasyFind!</h1>
              <p>Bạn muốn tham gia với vai trò nào?</p>
            </div>

            <div className="rp-role-grid">
              <button
                type="button"
                className={`rp-role-card ${form.role === 'player' ? 'rp-role-card--selected' : ''}`}
                onClick={() => set('role', 'player')}
              >
                <div className="rp-role-icon">🏸</div>
                <div className="rp-role-title">Người chơi</div>
                <div className="rp-role-desc">Tìm kèo cầu lông gần bạn, đặt slot và tham gia giao lưu</div>
                {form.role === 'player' && <div className="rp-role-check">✓</div>}
              </button>

              <button
                type="button"
                className={`rp-role-card ${form.role === 'host' ? 'rp-role-card--selected' : ''}`}
                onClick={() => set('role', 'host')}
              >
                <div className="rp-role-icon">🏆</div>
                <div className="rp-role-title">Host (Tổ chức)</div>
                <div className="rp-role-desc">Tạo kèo, quản lý danh sách người chơi và duyệt thanh toán</div>
                {form.role === 'host' && <div className="rp-role-check">✓</div>}
              </button>
            </div>

            <button type="button" className="rp-btn rp-btn--primary" onClick={nextStep} disabled={!form.role}>
              Tiếp tục →
            </button>
          </div>
        )}

        {/* ── Step 1: Personal Info ── */}
        {step === 1 && (
          <div className="rp-step-panel">
            <div className="rp-panel-head">
              <h1>Thông tin cá nhân</h1>
              <p>Giúp cộng đồng biết thêm về bạn</p>
            </div>

            <div className="rp-fields">
              <div className="rp-field">
                <label className="rp-label">Họ và tên <span className="rp-required">*</span></label>
                <input
                  type="text"
                  className="rp-input"
                  placeholder="Nguyễn Văn A"
                  value={form.full_name}
                  onChange={e => set('full_name', e.target.value)}
                  autoFocus
                />
              </div>

              <div className="rp-field">
                <label className="rp-label">Giới tính</label>
                <div className="rp-gender-row">
                  {[
                    { value: 'male',   label: 'Nam',  icon: '♂' },
                    { value: 'female', label: 'Nữ',   icon: '♀' },
                    { value: 'other',  label: 'Khác', icon: '⚧' },
                  ].map(g => (
                    <button
                      key={g.value}
                      type="button"
                      className={`rp-gender-btn ${form.gender === g.value ? 'rp-gender-btn--active' : ''}`}
                      onClick={() => set('gender', g.value)}
                    >
                      <span className="rp-gender-icon">{g.icon}</span>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rp-btn-row">
              <button type="button" className="rp-btn rp-btn--ghost" onClick={prevStep}>← Quay lại</button>
              <button type="button" className="rp-btn rp-btn--primary" onClick={nextStep}>Tiếp tục →</button>
            </div>
          </div>
        )}

        {/* ── Step 2: Account ── */}
        {step === 2 && (
          <form className="rp-step-panel" onSubmit={handleSubmit}>
            <div className="rp-panel-head">
              <h1>Tạo tài khoản</h1>
              <p>Bước cuối cùng — thiết lập đăng nhập của bạn</p>
            </div>

            <div className="rp-fields">
              <div className="rp-field">
                <label className="rp-label">Tên đăng nhập <span className="rp-required">*</span></label>
                <div className="rp-input-group">
                  <span className="rp-input-prefix">@</span>
                  <input
                    type="text"
                    className="rp-input rp-input--prefixed"
                    placeholder="nguyen_van_a"
                    required
                    autoFocus
                    value={form.username}
                    onChange={e => set('username', e.target.value)}
                  />
                </div>
              </div>

              <div className="rp-field">
                <label className="rp-label">Mật khẩu <span className="rp-required">*</span></label>
                <input
                  type="password"
                  className="rp-input"
                  placeholder="Ít nhất 6 ký tự"
                  required
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                />
                {form.password && (
                  <div className="rp-pw-strength">
                    <div className={`rp-pw-bar ${form.password.length >= 10 ? 'rp-pw-bar--strong' : form.password.length >= 6 ? 'rp-pw-bar--ok' : 'rp-pw-bar--weak'}`} />
                    <span>{form.password.length >= 10 ? 'Mạnh' : form.password.length >= 6 ? 'Đạt yêu cầu' : 'Yếu'}</span>
                  </div>
                )}
              </div>

              <div className="rp-field">
                <label className="rp-label">Xác nhận mật khẩu <span className="rp-required">*</span></label>
                <input
                  type="password"
                  className="rp-input"
                  placeholder="Nhập lại mật khẩu"
                  required
                  value={form.confirm_password}
                  onChange={e => set('confirm_password', e.target.value)}
                />
              </div>
            </div>

            {/* Summary chip */}
            <div className="rp-summary">
              <span>{form.role === 'host' ? '🏆 Host' : '🏸 Player'}</span>
              <span>•</span>
              <span>{form.full_name || '—'}</span>
              <span>•</span>
              <span>{form.gender === 'male' ? 'Nam' : form.gender === 'female' ? 'Nữ' : 'Khác'}</span>
            </div>

            <div className="rp-btn-row">
              <button type="button" className="rp-btn rp-btn--ghost" onClick={prevStep}>← Quay lại</button>
              <button type="submit" className="rp-btn rp-btn--primary" disabled={loading}>
                {loading ? (
                  <span className="rp-spinner" />
                ) : (
                  'Tạo tài khoản 🚀'
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Bottom text */}
      <p className="rp-footer">
        Bằng việc đăng ký, bạn đồng ý với <a href="#">Điều khoản sử dụng</a> của EasyFind
      </p>
    </div>
  );
}
