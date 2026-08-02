// src/components/AuthModal.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SKILL_LEVELS, CITIES } from '../utils/helpers';

const GENDER_OPTIONS = [
  { value: 'male',   label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other',  label: 'Khác' },
];

const ROLE_OPTIONS = [
  { value: 'player', label: 'Người chơi',    desc: 'Tìm kèo và tham gia cộng đồng' },
  { value: 'host',   label: 'Người tổ chức', desc: 'Tạo kèo và quản lý sân chơi' },
];

/* ─── Floating label input ─────────────────────── */
function FloatInput({ id, label, type = 'text', value, onChange, required, autoFocus }) {
  const [focused, setFocused] = useState(false);
  const active = focused || !!value;
  return (
    <div style={{ position: 'relative', marginBottom: 8 }}>
      <label
        htmlFor={id}
        style={{
          position: 'absolute', left: 13,
          top: active ? -9 : '50%',
          transform: active ? 'none' : 'translateY(-50%)',
          fontSize: active ? '0.72rem' : '0.9rem',
          color: focused ? 'var(--brand)' : 'var(--text-muted)',
          background: 'var(--bg-surface)',
          padding: active ? '0 4px' : '0',
          transition: 'all 0.15s ease',
          pointerEvents: 'none',
          zIndex: 1,
          fontWeight: active ? 500 : 400,
        }}
      >{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: '14px 13px',
          border: `1px solid ${focused ? 'var(--brand)' : 'var(--border-color)'}`,
          borderRadius: 6,
          fontSize: '0.9rem',
          color: 'var(--text-main)',
          background: 'var(--bg-surface)',
          outline: 'none',
          boxShadow: focused ? '0 0 0 3px var(--brand-light)' : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
}

/* ─── Main Component ───────────────────────────── */
export default function AuthModal({ onClose, defaultTab = 'login' }) {
  const { login, register } = useAuth();
  const [tab, setTab]     = useState(defaultTab);
  const [step, setStep]   = useState(1);   // register steps 1-3
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [showPw, setShowPw]   = useState(false);

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [regForm, setRegForm] = useState({
    full_name: '', username: '', password: '', confirm_password: '',
    role: 'player', gender: 'male', skill_level: 'Trung bình', city: 'Hà Nội',
  });

  function setReg(k, v) { setRegForm(f => ({ ...f, [k]: v })); setError(''); }

  function switchTab(t) { setTab(t); setStep(1); setError(''); setSuccess(''); }

  /* ── Login ── */
  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(loginForm.username, loginForm.password);
      setSuccess(`Chào mừng trở lại, ${user.full_name}!`);
      setTimeout(onClose, 900);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  /* ── Register step validation ── */
  function nextStep() {
    if (step === 1) {
      if (!regForm.full_name.trim()) return setError('Vui lòng nhập họ và tên');
      if (!regForm.username.trim())  return setError('Vui lòng nhập tên đăng nhập');
    }
    if (step === 2) {
      if (!regForm.password)                                   return setError('Vui lòng nhập mật khẩu');
      if (regForm.password.length < 6)                         return setError('Mật khẩu phải ít nhất 6 ký tự');
      if (regForm.password !== regForm.confirm_password)       return setError('Mật khẩu xác nhận không khớp');
    }
    setError('');
    setStep(s => s + 1);
  }

  /* ── Register submit ── */
  async function handleRegister(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { confirm_password, ...payload } = regForm;
      const user = await register(payload);
      setSuccess(`Đăng ký thành công! Chào mừng ${user.full_name}!`);
      setTimeout(onClose, 900);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  /* ── Step content definitions ── */
  const STEPS = [
    { title: 'Tạo tài khoản',    subtitle: 'Nhập thông tin cơ bản' },
    { title: 'Tạo mật khẩu',     subtitle: 'Dùng ít nhất 6 ký tự' },
    { title: 'Thông tin cá nhân', subtitle: 'Để tìm kèo phù hợp hơn' },
  ];

  const isRegister = tab === 'register';
  const currentStep = isRegister ? STEPS[step - 1] : null;

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: 16,
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
        width: '100%',
        maxWidth: isRegister ? 660 : 440,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: isRegister ? 'row' : 'column',
        minHeight: isRegister ? 380 : 'auto',
        transition: 'max-width 0.25s ease',
      }}>

        {/* ── LEFT PANEL (Register only) ── */}
        {isRegister && (
          <div style={{
            width: 210, flexShrink: 0,
            padding: '36px 28px',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              {/* Logo mark */}
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'linear-gradient(135deg, var(--brand), #60A5FA)',
                marginBottom: 24,
              }} />

              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.25, marginBottom: 8 }}>
                {currentStep.title}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                {currentStep.subtitle}
              </p>
            </div>

            {/* Step dots */}
            <div style={{ display: 'flex', gap: 6, marginTop: 32 }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{
                  height: 4, flex: i + 1 <= step ? 1 : 0.3,
                  borderRadius: 9,
                  background: i + 1 <= step ? 'var(--brand)' : 'var(--border-color)',
                  transition: 'all 0.3s ease',
                }} />
              ))}
            </div>
          </div>
        )}

        {/* ── RIGHT / MAIN PANEL ── */}
        <div style={{ flex: 1, padding: isRegister ? '36px 32px' : '32px' }}>

          {/* Login header */}
          {!isRegister && (
            <div style={{ marginBottom: 24 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 7,
                background: 'linear-gradient(135deg, var(--brand), #60A5FA)',
                marginBottom: 16,
              }} />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)' }}>Đăng nhập</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>Chào mừng trở lại!</p>
            </div>
          )}

          {/* Error / Success */}
          {(error || success) && (
            <div style={{
              padding: '9px 13px', fontSize: '0.83rem', borderRadius: 7,
              marginBottom: 16,
              background: success ? '#F0FDF4' : '#FEF2F2',
              border: `1px solid ${success ? '#BBF7D0' : '#FECACA'}`,
              color: success ? '#15803D' : '#B91C1C',
              fontWeight: 500,
            }}>
              {error || success}
            </div>
          )}

          {/* ───── LOGIN FORM ───── */}
          {!isRegister && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <FloatInput id="lg-user" label="Tên đăng nhập" value={loginForm.username}
                onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))} autoFocus />
              <FloatInput id="lg-pw" label="Mật khẩu" type="password" value={loginForm.password}
                onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                <button type="button" onClick={() => switchTab('register')}
                  style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                  Tạo tài khoản
                </button>
                <button type="submit" disabled={loading}
                  style={{
                    background: 'var(--brand)', color: '#fff',
                    border: 'none', borderRadius: 100,
                    padding: '10px 24px', fontWeight: 600, fontSize: '0.9rem',
                    cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
                    opacity: loading ? 0.7 : 1,
                  }}>
                  {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
              </div>
            </form>
          )}

          {/* ───── REGISTER FORM ───── */}
          {isRegister && (
            <form onSubmit={step < 3 ? e => { e.preventDefault(); nextStep(); } : handleRegister}
              style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

              {/* STEP 1: Tên & Username */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <FloatInput id="rg-name" label="Họ và tên" value={regForm.full_name}
                    onChange={e => setReg('full_name', e.target.value)} autoFocus />
                  <FloatInput id="rg-user" label="Tên đăng nhập" value={regForm.username}
                    onChange={e => setReg('username', e.target.value)} />
                </div>
              )}

              {/* STEP 2: Mật khẩu */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <FloatInput id="rg-pw" label="Mật khẩu" type={showPw ? 'text' : 'password'} value={regForm.password}
                    onChange={e => setReg('password', e.target.value)} autoFocus />
                  <FloatInput id="rg-pw2" label="Xác nhận" type={showPw ? 'text' : 'password'} value={regForm.confirm_password}
                    onChange={e => setReg('confirm_password', e.target.value)} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', marginTop: 4 }}>
                    <input type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)}
                      style={{ accentColor: 'var(--brand)', width: 15, height: 15 }} />
                    Hiện mật khẩu
                  </label>
                </div>
              )}

              {/* STEP 3: Thông tin bổ sung */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {/* Giới tính */}
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Giới tính</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {GENDER_OPTIONS.map(g => (
                        <div key={g.value} onClick={() => setReg('gender', g.value)}
                          style={{
                            flex: 1, textAlign: 'center', padding: '10px', cursor: 'pointer', borderRadius: 8,
                            border: `1.5px solid ${regForm.gender === g.value ? 'var(--brand)' : 'var(--border-color)'}`,
                            background: regForm.gender === g.value ? 'var(--brand-light)' : 'var(--bg-surface)',
                            fontWeight: 600, fontSize: '0.85rem',
                            color: regForm.gender === g.value ? 'var(--brand)' : 'var(--text-sub)',
                            transition: 'all 0.15s',
                          }}>
                          {g.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trình độ + Thành phố */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trình độ</div>
                      <select value={regForm.skill_level} onChange={e => setReg('skill_level', e.target.value)}
                        className="form-select" style={{ width: '100%' }}>
                        {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thành phố</div>
                      <select value={regForm.city} onChange={e => setReg('city', e.target.value)}
                        className="form-select" style={{ width: '100%' }}>
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer nav */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 24 }}>
                {step === 1 ? (
                  <button type="button" onClick={() => switchTab('login')}
                    style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                    Đã có tài khoản?
                  </button>
                ) : (
                  <button type="button" onClick={() => { setStep(s => s - 1); setError(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                    Quay lại
                  </button>
                )}

                <button type="submit" disabled={loading}
                  style={{
                    background: 'var(--brand)', color: '#fff',
                    border: 'none', borderRadius: 100,
                    padding: '10px 28px', fontWeight: 600, fontSize: '0.9rem',
                    cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
                    opacity: loading ? 0.7 : 1,
                    transition: 'opacity 0.15s',
                  }}>
                  {loading ? 'Đang xử lý...' : step < 3 ? 'Tiếp theo' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
