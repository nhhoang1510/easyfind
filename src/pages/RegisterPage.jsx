// src/pages/RegisterPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SKILL_LEVELS, CITIES } from '../utils/helpers';

// IMPORT FIREBASE AUTH
import { auth } from '../api/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

/* ── Floating label input ───────────────────────────────── */
function FloatInput({ id, label, type = 'text', value, onChange, required, autoFocus, maxLength }) {
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
        required={required} autoFocus={autoFocus} maxLength={maxLength}
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

/* ── Main ──────────────────────────────────────────────── */
export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  // STATE LƯU KẾT QUẢ FIREBASE OTP
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [form, setForm] = useState({
    full_name: '', username: '',
    password: '', confirm_password: '',
    role: 'player', gender: 'male',
    skill_level: 'Trung bình', city: 'Hà Nội',
    phone: '', otp: ''
  });

  const steps = [
    { id: 'account', title: 'Tạo tài khoản',     subtitle: 'Nhập tên của bạn' },
    { id: 'details', title: 'Thông tin cá nhân', subtitle: 'Cho chúng tôi biết thêm về bạn' },
    ...(form.role === 'host' ? [{ id: 'otp', title: 'Xác minh SĐT', subtitle: 'Bảo vệ cộng đồng khỏi tài khoản ảo' }] : []),
    { id: 'password', title: 'Tạo mật khẩu',     subtitle: 'Dùng ít nhất 6 ký tự' },
  ];

  const currentStepInfo = steps[step];
  const isLast = step === steps.length - 1;

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setError(''); }

  // HÀM KHỞI TẠO RECAPTCHA CỦA FIREBASE
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {}
      });
    }
  };

  async function nextStep() {
    const stepId = steps[step].id;

    if (stepId === 'account') {
      if (!form.full_name.trim()) return setError('Vui lòng nhập họ và tên');
      if (!form.username.trim())  return setError('Vui lòng nhập tên đăng nhập');
    }
    
    if (stepId === 'details') {
      if (form.role === 'host') {
        if (!form.phone.trim() || form.phone.length < 10) return setError('Vui lòng nhập số điện thoại hợp lệ');
        
        setLoading(true);
        try {
          setupRecaptcha();
          const appVerifier = window.recaptchaVerifier;
          
          const formattedPhone = form.phone.startsWith('0') 
            ? '+84' + form.phone.slice(1) 
            : '+' + form.phone;

          const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
          setConfirmationResult(result);
          
        } catch (err) {
          console.error("Lỗi gửi OTP:", err);
          setLoading(false);
          if (window.recaptchaVerifier) {
            window.recaptchaVerifier.render().then(widgetId => {
              window.grecaptcha.reset(widgetId);
            });
          }
          return setError('Không thể gửi OTP. Vui lòng kiểm tra lại SĐT và thử lại.');
        }
        setLoading(false);
      }
    }

    if (stepId === 'otp') {
      if (form.otp.length < 6) return setError('Vui lòng nhập đủ 6 số mã OTP');
      
      setLoading(true);
      try {
        await confirmationResult.confirm(form.otp);
      } catch (err) {
        console.error("Lỗi xác minh OTP:", err);
        setLoading(false);
        return setError('Mã OTP không chính xác hoặc đã hết hạn.');
      }
      setLoading(false);
    }

    setError('');
    setStep(s => Math.min(s + 1, steps.length - 1));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.password) return setError('Vui lòng nhập mật khẩu');
    if (form.password.length < 6) return setError('Mật khẩu phải ít nhất 6 ký tự');
    if (form.password !== form.confirm_password) return setError('Mật khẩu xác nhận không khớp');
    
    setError(''); setLoading(true);
    try {
      const { confirm_password, otp, ...payload } = form;
      
      if (payload.role === 'host') {
        delete payload.skill_level;
        delete payload.city;
      } else {
        delete payload.phone;
      }

      await register(payload);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isMobile = window.innerWidth < 768;

  return (
    <div style={{
      minHeight: '100vh', background: '#f1f3f4',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 12, fontFamily: "'Inter', 'Google Sans', system-ui, sans-serif",
    }}>
      {/* Card */}
      <div style={{
        background: '#fff', borderRadius: 16,
        boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
        width: '100%', maxWidth: 860,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        minHeight: isMobile ? 'auto' : 420,
        overflow: 'hidden',
      }}>
        {/* Left panel (Mở rộng width lên 280 để chữ không bị rớt dòng) */}
        <div style={{
          width: isMobile ? '100%' : 280, flexShrink: 0,
          padding: isMobile ? '24px 20px 16px 20px' : '40px 28px',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          background: isMobile ? '#f8f9fa' : '#fff',
          borderBottom: isMobile ? '1px solid #dadce0' : 'none',
        }}>
          <div>
            <div style={{
              width: 40, height: 40, borderRadius: 10, marginBottom: isMobile ? 12 : 28,
              background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '1.1rem', fontWeight: 700,
            }}>E</div>

            <h1 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 600, color: '#202124', lineHeight: 1.25, marginBottom: 10 }}>
              {currentStepInfo.title}
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#5f6368', lineHeight: 1.6, margin: 0 }}>
              {currentStepInfo.subtitle}
            </p>
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', gap: 5, marginTop: isMobile ? 16 : 32 }}>
            {steps.map((_, i) => (
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
        <div style={{ flex: 1, padding: isMobile ? '24px 20px' : '40px 36px', display: 'flex', flexDirection: 'column' }}>
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
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            {/* Vùng bọc nội dung căn giữa (Vertical Center) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, paddingBottom: 16 }}>
              {currentStepInfo.id === 'account' && (
                <>
                  <FloatInput id="rg-name" label="Họ và tên" value={form.full_name}
                    onChange={e => set('full_name', e.target.value)} autoFocus />
                  <FloatInput id="rg-user" label="Tên đăng nhập" value={form.username}
                    onChange={e => set('username', e.target.value)} />
                </>
              )}

              {currentStepInfo.id === 'details' && (
                <>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', marginBottom: 8, textTransform: 'uppercase' }}>Vai trò</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        { value: 'player', label: 'Người chơi', desc: 'Tìm kèo, tham gia' },
                        { value: 'host',   label: 'Người tổ chức', desc: 'Tạo kèo, quản lý' },
                      ].map(r => (
                        <div key={r.value} onClick={() => set('role', r.value)} style={{
                          padding: '11px 12px', cursor: 'pointer', borderRadius: 8,
                          border: `1.5px solid ${form.role === r.value ? '#1a73e8' : '#dadce0'}`,
                          background: form.role === r.value ? '#e8f0fe' : '#fff',
                        }}>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: form.role === r.value ? '#1a73e8' : '#202124' }}>{r.label}</div>
                          <div style={{ fontSize: '0.76rem', color: '#5f6368', marginTop: 2 }}>{r.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', marginBottom: 8, textTransform: 'uppercase' }}>Giới tính</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[{ value: 'male', label: 'Nam' }, { value: 'female', label: 'Nữ' }].map(g => (
                        <div key={g.value} onClick={() => set('gender', g.value)} style={{
                          flex: 1, textAlign: 'center', padding: '10px', cursor: 'pointer', borderRadius: 8,
                          border: `1.5px solid ${form.gender === g.value ? '#1a73e8' : '#dadce0'}`,
                          background: form.gender === g.value ? '#e8f0fe' : '#fff',
                          fontWeight: 600, fontSize: '0.88rem',
                          color: form.gender === g.value ? '#1a73e8' : '#3c4043',
                        }}>{g.label}</div>
                      ))}
                    </div>
                  </div>

                  {form.role === 'host' ? (
                    <FloatInput id="rg-phone" type="tel" label="Số điện thoại (Bắt buộc)" value={form.phone}
                      onChange={e => set('phone', e.target.value)} />
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', marginBottom: 6, textTransform: 'uppercase' }}>Trình độ</div>
                        <select value={form.skill_level} onChange={e => set('skill_level', e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid #dadce0', borderRadius: 6, fontSize: '0.9rem', outline: 'none', background: '#fff' }}>
                          {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', marginBottom: 6, textTransform: 'uppercase' }}>Thành phố</div>
                        <select value={form.city} onChange={e => set('city', e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid #dadce0', borderRadius: 6, fontSize: '0.9rem', outline: 'none', background: '#fff' }}>
                          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                </>
              )}

              {currentStepInfo.id === 'otp' && (
                <>
                  <div style={{ fontSize: '0.9rem', color: '#202124', marginBottom: 4 }}>
                    Mã xác minh 6 số đã được gửi tới SĐT <b>{form.phone}</b>
                  </div>
                  <FloatInput id="rg-otp" label="Nhập mã OTP" type="text" maxLength={6}
                    value={form.otp} onChange={e => set('otp', e.target.value.replace(/\D/g, ''))} autoFocus />
                </>
              )}

              {currentStepInfo.id === 'password' && (
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
            </div>

            <div id="recaptcha-container"></div>

            {/* Footer nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #f1f3f4' }}>
              {step === 0 ? (
                <Link to="/login" style={{ fontSize: '0.88rem', color: '#1a73e8', textDecoration: 'none', fontWeight: 500 }}>
                  Đăng nhập
                </Link>
              ) : (
                <button type="button" onClick={() => { setStep(s => s - 1); setError(''); }}
                  style={{ background: 'none', border: 'none', color: '#5f6368', fontSize: '0.88rem', cursor: 'pointer', fontWeight: 500 }}>
                  Quay lại
                </button>
              )}

              <button type="submit" disabled={loading}
                style={{
                  background: loading ? '#aecbfa' : '#1a73e8', color: '#fff', border: 'none', borderRadius: 100,
                  padding: '10px 28px', fontWeight: 600, fontSize: '0.92rem', cursor: loading ? 'wait' : 'pointer',
                }}>
                {loading ? 'Đang xử lý...' : isLast ? 'Hoàn tất' : 'Tiếp theo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
