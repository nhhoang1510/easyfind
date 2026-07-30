// src/pages/CreateMatchPage.jsx - Full page version of Create Match
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { SKILL_LEVELS, CITIES, HN_DISTRICTS, HCM_DISTRICTS, DN_DISTRICTS, SHUTTLECOCKS, BANKS } from '../utils/helpers';

const districtMap = { 'Hà Nội': HN_DISTRICTS, 'TP.HCM': HCM_DISTRICTS, 'Đà Nẵng': DN_DISTRICTS };

const defaultForm = {
  title: '', host_name: '', host_phone: '', court_name: '', court_id: '',
  city: 'Hà Nội', district: '', play_date: '', start_time: '', end_time: '',
  max_slots: 10, cost_per_slot: 60000, shuttlecock: 'Ba Sao',
  skill_level: 'Tất cả trình độ', note: '',
  bank_name: '', bank_account: '', bank_owner: '',
};

const STEPS = [
  { num: 1, label: 'Cơ bản' },
  { num: 2, label: 'Chi tiết' },
  { num: 3, label: 'Thanh toán' },
];

export default function CreateMatchPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ...defaultForm,
    play_date:  new Date().toISOString().split('T')[0],
    host_name:  user?.full_name || '',
    host_phone: user?.phone || '',
  });
  const [courts, setCourts] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Court search state
  const [courtSearch, setCourtSearch] = useState('');
  const [courtDropOpen, setCourtDropOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'host') {
      navigate('/');
    }
    api.getCourts().then(setCourts).catch(() => {});
  }, [user, navigate]);

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v, ...(k === 'city' ? { district: '', court_id: '', court_name: '' } : {}) }));
  }

  function handleCourtSearchChange(val) {
    setCourtSearch(val);
    setCourtDropOpen(true);
    // If user is typing freely, treat it as a custom court name
    setForm(f => ({ ...f, court_id: '', court_name: val }));
  }

  function handleCourtSelect(court) {
    setCourtSearch(court.name);
    setCourtDropOpen(false);
    setForm(f => ({ ...f, court_id: court.id, court_name: court.name, district: court.district, city: court.city }));
  }

  function handleCourtClear() {
    setCourtSearch('');
    setCourtDropOpen(false);
    setForm(f => ({ ...f, court_id: '', court_name: '' }));
  }


  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      const payload = { ...form, max_slots: parseInt(form.max_slots), cost_per_slot: parseFloat(form.cost_per_slot) || 0 };
      await api.createMatch(payload);
      navigate('/');
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  const districts = districtMap[form.city] || [];
  const filteredCourts = courts.filter(c => !form.district || c.district === form.district);

  return (
    <div className="create-page">
      {/* Top bar */}
      <div className="create-page-topbar">
        <Link to="/" className="create-page-logo" style={{ textDecoration: 'none' }}>
          EasyFind
        </Link>
      </div>

      <div className="create-page-body">
        {/* Header */}
        <div className="create-page-header">
          <h1 className="create-page-title">Tạo Kèo Mới</h1>
          <p className="create-page-sub">Chỉ mất 2 phút để tạo kèo và chia sẻ với anh em!</p>

          {/* Step indicator */}
          <div className="create-steps">
            {STEPS.map((s, i) => (
              <div key={s.num} className="create-steps-item">
                <div
                  className={`create-steps-circle ${step === s.num ? 'create-steps-circle--active' : step > s.num ? 'create-steps-circle--done' : ''}`}
                  onClick={() => step > s.num && setStep(s.num)}
                >
                  {step > s.num ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : s.num}
                </div>
                <span className={`create-steps-label ${step === s.num ? 'create-steps-label--active' : ''}`}>{s.label}</span>
                {i < STEPS.length - 1 && <div className={`create-steps-line ${step > s.num ? 'create-steps-line--done' : ''}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="create-card">
          {msg && (
            <div className={`auth-alert ${msg.type === 'error' ? 'auth-alert--error' : 'auth-alert--success'}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* ─── Step 1 ─── */}
            {step === 1 && (
              <div className="create-form-body">
                <div className="form-group">
                  <label className="form-label">TIÊU ĐỀ KÈO *</label>
                  <input className="form-input" required placeholder="VD: Kèo Chiều Thứ 4 Đống Đa - Trung Bình"
                    value={form.title} onChange={e => set('title', e.target.value)} />
                </div>

                <div className="auth-grid-2">
                  <div className="form-group">
                    <label className="form-label">TÊN HOST *</label>
                    <input className="form-input" required placeholder="Họ tên host"
                      value={form.host_name} onChange={e => set('host_name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SĐT / ZALO CỦA HOST</label>
                    <input className="form-input" placeholder="0912 345 678"
                      value={form.host_phone} onChange={e => set('host_phone', e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">THÀNH PHỐ *</label>
                  <select className="form-select" value={form.city} onChange={e => set('city', e.target.value)}>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="auth-grid-2">
                  <div className="form-group">
                    <label className="form-label">QUẬN / HUYỆN</label>
                    <select className="form-select" value={form.district} onChange={e => set('district', e.target.value)}>
                      <option value="">-- Chọn quận/huyện --</option>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label">TÊN SÂN (TÌM HOẶC NHẬP MỚI) *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Gõ tên sân để tìm hoặc nhập mới..."
                        value={courtSearch || form.court_name}
                        onChange={e => handleCourtSearchChange(e.target.value)}
                        onFocus={() => setCourtDropOpen(true)}
                      />
                      {(courtSearch || form.court_name) && (
                        <button
                          type="button"
                          onClick={handleCourtClear}
                          style={{
                            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem'
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {courtDropOpen && (
                      <div
                        style={{
                          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                          background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                          borderRadius: 'var(--r-sm)', boxShadow: 'var(--shadow-md)',
                          maxHeight: '200px', overflowY: 'auto', marginTop: 4
                        }}
                      >
                        {courts.filter(c => 
                          (!form.district || c.district === form.district) &&
                          (!courtSearch || c.name.toLowerCase().includes(courtSearch.toLowerCase()))
                        ).length > 0 ? (
                          courts.filter(c => 
                            (!form.district || c.district === form.district) &&
                            (!courtSearch || c.name.toLowerCase().includes(courtSearch.toLowerCase()))
                          ).map(c => (
                            <div
                              key={c.id}
                              onClick={() => handleCourtSelect(c)}
                              style={{
                                padding: '10px 14px', cursor: 'pointer', fontSize: '0.85rem',
                                borderBottom: '1px solid var(--border-color)'
                              }}
                              onMouseDown={e => e.preventDefault()}
                            >
                              <div style={{ fontWeight: 600 }}>{c.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.address || `${c.district}, ${c.city}`}</div>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '10px 14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Không tìm thấy sân có sẵn trong danh mục. Tên vừa nhập sẽ được dùng làm tên sân mới.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ─── Step 2 ─── */}
            {step === 2 && (
              <div className="create-form-body">
                <div className="form-group">
                  <label className="form-label">NGÀY CHƠI *</label>
                  <input type="date" className="form-input" required min={new Date().toISOString().split('T')[0]}
                    value={form.play_date} onChange={e => set('play_date', e.target.value)} />
                </div>

                <div className="auth-grid-2">
                  <div className="form-group">
                    <label className="form-label">GIỜ BẮT ĐẦU *</label>
                    <input type="time" className="form-input" required
                      value={form.start_time} onChange={e => set('start_time', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GIỜ KẾT THÚC *</label>
                    <input type="time" className="form-input" required
                      value={form.end_time} onChange={e => set('end_time', e.target.value)} />
                  </div>
                </div>

                <div className="auth-grid-2">
                  <div className="form-group">
                    <label className="form-label">SỐ SUẤT TỐI ĐA *</label>
                    <input type="number" className="form-input" required min={2} max={50}
                      value={form.max_slots} onChange={e => set('max_slots', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GIÁ / NGƯỜI (VNĐ)</label>
                    <input type="number" className="form-input" required min={0} step={5000}
                      value={form.cost_per_slot} onChange={e => set('cost_per_slot', e.target.value)} />
                  </div>
                </div>

                <div className="auth-grid-2">
                  <div className="form-group">
                    <label className="form-label">TRÌNH ĐỘ YÊU CẦU</label>
                    <select className="form-select" value={form.skill_level} onChange={e => set('skill_level', e.target.value)}>
                      <option value="Tất cả trình độ">Tất cả trình độ</option>
                      {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">LOẠI CẦU</label>
                    <select className="form-select" value={form.shuttlecock} onChange={e => set('shuttlecock', e.target.value)}>
                      {(SHUTTLECOCKS || ['Ba Sao', 'Yonex Aerosensa', 'Victor NS']).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">GHI CHÚ THÊM</label>
                  <textarea className="form-input" rows={3} placeholder="Thông tin thêm về kèo, yêu cầu đặc biệt..."
                    value={form.note} onChange={e => set('note', e.target.value)} style={{ resize: 'vertical' }} />
                </div>
              </div>
            )}

            {/* ─── Step 3 ─── */}
            {step === 3 && (
              <div className="create-form-body">
                <div className="create-payment-info">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>Thêm thông tin ngân hàng để người chơi chuyển cọc khi đăng ký.</span>
                </div>

                <div className="form-group">
                  <label className="form-label">NGÂN HÀNG</label>
                  <select className="form-select" value={form.bank_name} onChange={e => set('bank_name', e.target.value)}>
                    <option value="">-- Chọn ngân hàng --</option>
                    {(BANKS || ['Vietcombank', 'Techcombank', 'MB Bank', 'BIDV', 'Agribank', 'VPBank', 'ACB', 'TPBank']).map(b => {
                      const bankName = typeof b === 'string' ? b : (b?.name || b?.code || '');
                      return <option key={bankName} value={bankName}>{bankName}</option>;
                    })}
                  </select>
                </div>

                <div className="auth-grid-2">
                  <div className="form-group">
                    <label className="form-label">SỐ TÀI KHOẢN</label>
                    <input className="form-input" placeholder="1234567890"
                      value={form.bank_account} onChange={e => set('bank_account', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CHỦ TÀI KHOẢN</label>
                    <input className="form-input" placeholder="NGUYEN VAN A"
                      value={form.bank_owner} onChange={e => set('bank_owner', e.target.value)} />
                  </div>
                </div>

                {/* Summary */}
                <div className="create-summary">
                  <h3 className="create-summary-title">Tóm tắt kèo</h3>
                  <div className="create-summary-grid">
                    <span className="create-summary-key">Tiêu đề</span>
                    <span className="create-summary-val">{form.title || '—'}</span>
                    <span className="create-summary-key">Địa điểm</span>
                    <span className="create-summary-val">{form.court_name || '—'}, {form.district}, {form.city}</span>
                    <span className="create-summary-key">Ngày chơi</span>
                    <span className="create-summary-val">{form.play_date} • {form.start_time} – {form.end_time}</span>
                    <span className="create-summary-key">Số suất</span>
                    <span className="create-summary-val">{form.max_slots} người</span>
                    <span className="create-summary-key">Giá</span>
                    <span className="create-summary-val" style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
                      {Number(form.cost_per_slot).toLocaleString('vi-VN')}đ / người
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="create-nav-btns">
              {step > 1 ? (
                <button type="button" className="create-btn-back" onClick={() => setStep(s => s - 1)}>
                  ← Quay lại
                </button>
              ) : (
                <Link to="/" className="create-btn-back">← Huỷ</Link>
              )}

              {step < 3 ? (
                <button type="button" className="create-btn-next" onClick={() => setStep(s => s + 1)}>
                  Tiếp theo →
                </button>
              ) : (
                <button type="submit" className="create-btn-submit" disabled={loading}>
                  {loading ? 'Đang tạo kèo...' : '🏸 Đăng kèo'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
