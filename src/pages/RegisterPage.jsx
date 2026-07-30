// src/pages/RegisterPage.jsx — Google-style multi-step registration
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SKILL_LEVELS, CITIES } from '../utils/helpers';

/* ── Floating label input ───────────────────────────────── */
function FloatInput({ id, label, type = 'text', value, onChange, required, autoFocus }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || !!value;
  return (
    <div style={{ position: 'relative' }}>
      <label
        htmlFor={id}
        style={{
          position: 'absolute',
          left: 14, zIndex: 1, pointerEvents: 'none',
          top: lifted ? -9 : '50%',
          transform: lifted ? 'none' : 'translateY(-50%)',
          fontSize: lifted ? '0.72rem' : '0.92rem',
          fontWeight: lifted ? 500 : 400,
          color: focused ? '#1a73e8' : '#5f6368',
          background: '#fff',
          padding: lifted ? '0 4px' : '0',
          transition: 'all 0.15s ease',
        }}
      >{label}</label>
      <input
        id={id} type={type} value={value} onChange={onChange}
        required={required} autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '15px 14px',
          border: `1px solid ${focused ? '#1a73e8' : '#dadce0'}`,
          borderRadius: 6, fontSize: '0.95rem',
          color: '#202124', background: '#fff', outline: 'none',
          boxShadow: focused ? '0 0 0 2px rgba(26,115,232,0.15)' : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
}

/* ── Step definitions ──────────────────────────────────── */
const STEPS = [
  { title: 'Tạo tài khoản',     subtitle: 'Nhập tên của bạn' },
  { title: 'Thông tin cá nhân', subtitle: 'Cho chúng tôi biết thêm về bạn' },
  { title: 'Tạo mật khẩu',      subtitle: 'Dùng ít nhất 6 ký tự' },
];

/* ── Main ──────────────────────────────────────────────── */
export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [form, setForm] = useState({
    full_name: '', username: '',
    password: '', confirm_password: '',
    role: 'player', gender: 'male',
    skill_level: 'Trung bình', city: 'Hà Nội',
  });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setError(''); }

  function nextStep() {
    if (step === 0) {
      if (!form.full_name.trim()) return setError('Vui lòng nhập họ và tên');
      if (!form.username.trim())  return setError('Vui lòng nhập tên đăng nhập');
    }
    if (step === 2) {
      if (!form.password)                              return setError('Vui lòng nhập mật khẩu');
      if (form.password.length < 6)                    return setError('Mật khẩu phải ít nhất 6 ký tự');
      if (form.password !== form.confirm_password)     return setError('Mật khẩu xác nhận không khớp');
    }
    setError('');
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.password)                          return setError('Vui lòng nhập mật khẩu');
    if (form.password.length < 6)                return setError('Mật khẩu phải ít nhất 6 ký tự');
    if (form.password !== form.confirm_password) return setError('Mật khẩu xác nhận không khớp');
    setError(''); setLoading(true);
    try {
      const { confirm_password, ...payload } = form;
      await register(payload);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isLast = step === STEPS.length - 1;

  return (
    <div style={{
      minHeight: '100vh', background: '#f1f3f4',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 16, fontFamily: "'Inter', 'Google Sans', system-ui, sans-serif",
    }}>
      {/* Card */}
      <div style={{
        background: '#fff', borderRadius: 16,
        boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
        width: '100%', maxWidth: 860,
        display: 'flex', minHeight: 370,
        overflow: 'hidden',
      }}>
        {/* Left panel */}
        <div style={{
          width: 220, flexShrink: 0,
          padding: '40px 28px',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            {/* Logo */}
            <div style={{
              width: 40, height: 40, borderRadius: 10, marginBottom: 28,
              background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '1.1rem', fontWeight: 700,
            }}>E</div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#202124', lineHeight: 1.25, marginBottom: 10 }}>
              {STEPS[step].title}
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#5f6368', lineHeight: 1.6 }}>
              {STEPS[step].subtitle}
            </p>
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', gap: 5, marginTop: 32 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                height: 4, flex: i <= step ? 1.5 : 1,
                borderRadius: 9,
                background: i <= step ? '#1a73e8' : '#dadce0',
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ flex: 1, padding: '40px 36px', display: 'flex', flexDirection: 'column' }}>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: 16, padding: '9px 13px',
              background: '#fce8e6', borderRadius: 6,
              fontSize: '0.84rem', color: '#c5221f', fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <form
            onSubmit={isLast ? handleSubmit : e => { e.preventDefault(); nextStep(); }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            {/* STEP 0: Tên & Username */}
            {step === 0 && (
              <>
                <FloatInput id="rg-name" label="Họ và tên" value={form.full_name}
                  onChange={e => set('full_name', e.target.value)} autoFocus />
                <FloatInput id="rg-user" label="Tên đăng nhập" value={form.username}
                  onChange={e => set('username', e.target.value)} />
              </>
            )}

            {/* STEP 1: Vai trò, Giới tính, Trình độ, Thành phố */}
            {step === 1 && (
              <>
                {/* Vai trò */}
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vai trò</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { value: 'player', label: 'Người chơi',    desc: 'Tìm kèo, tham gia cộng đồng' },
                      { value: 'host',   label: 'Người tổ chức', desc: 'Tạo kèo, quản lý sân chơi' },
                    ].map(r => (
                      <div key={r.value} onClick={() => set('role', r.value)} style={{
                        padding: '11px 12px', cursor: 'pointer', borderRadius: 8,
                        border: `1.5px solid ${form.role === r.value ? '#1a73e8' : '#dadce0'}`,
                        background: form.role === r.value ? '#e8f0fe' : '#fff',
                        transition: 'all 0.15s',
                      }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: form.role === r.value ? '#1a73e8' : '#202124' }}>{r.label}</div>
                        <div style={{ fontSize: '0.76rem', color: '#5f6368', marginTop: 2 }}>{r.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Giới tính */}
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Giới tính</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[{ value: 'male', label: 'Nam' }, { value: 'female', label: 'Nữ' }, { value: 'other', label: 'Khác' }].map(g => (
                      <div key={g.value} onClick={() => set('gender', g.value)} style={{
                        flex: 1, textAlign: 'center', padding: '10px', cursor: 'pointer', borderRadius: 8,
                        border: `1.5px solid ${form.gender === g.value ? '#1a73e8' : '#dadce0'}`,
                        background: form.gender === g.value ? '#e8f0fe' : '#fff',
                        fontWeight: 600, fontSize: '0.88rem',
                        color: form.gender === g.value ? '#1a73e8' : '#3c4043',
                        transition: 'all 0.15s',
                      }}>{g.label}</div>
                    ))}
                  </div>
                </div>

                {/* Trình độ + Thành phố */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trình độ</div>
                    <select value={form.skill_level} onChange={e => set('skill_level', e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #dadce0', borderRadius: 6, fontSize: '0.9rem', color: '#202124', background: '#fff', fontFamily: 'inherit', outline: 'none' }}>
                      {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thành phố</div>
                    <select value={form.city} onChange={e => set('city', e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #dadce0', borderRadius: 6, fontSize: '0.9rem', color: '#202124', background: '#fff', fontFamily: 'inherit', outline: 'none' }}>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* STEP 2: Mật khẩu */}
            {step === 2 && (
              <>
                <FloatInput id="rg-pw" label="Mật khẩu" type={showPw ? 'text' : 'password'}
                  value={form.password} onChange={e => set('password', e.target.value)} autoFocus />
                <FloatInput id="rg-pw2" label="Xác nhận mật khẩu" type={showPw ? 'text' : 'password'}
                  value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.87rem', color: '#5f6368', cursor: 'pointer' }}>
                  <input type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)}
                    style={{ accentColor: '#1a73e8', width: 15, height: 15 }} />
                  Hiện mật khẩu
                </label>
              </>
            )}

            {/* Footer nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8 }}>
              {step === 0 ? (
                <Link to="/login" style={{ fontSize: '0.88rem', color: '#1a73e8', textDecoration: 'none', fontWeight: 500 }}>
                  Đăng nhập
                </Link>
              ) : (
                <button type="button" onClick={() => { setStep(s => s - 1); setError(''); }}
                  style={{ background: 'none', border: 'none', color: '#5f6368', fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                  Quay lại
                </button>
              )}

              <button type="submit" disabled={loading}
                style={{
                  background: loading ? '#aecbfa' : '#1a73e8',
                  color: '#fff', border: 'none', borderRadius: 100,
                  padding: '10px 28px', fontWeight: 600, fontSize: '0.92rem',
                  cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
                  transition: 'background 0.15s',
                }}>
                {loading ? 'Đang xử lý...' : isLast ? 'Tạo tài khoản' : 'Tiếp theo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
