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

  useEffect(() => {
    if (!user || user.role !== 'host') {
      navigate('/');
    }
    api.getCourts().then(setCourts).catch(() => {});
  }, [user, navigate]);

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v, ...(k === 'city' ? { district: '', court_id: '', court_name: '' } : {}) }));
  }

  function handleCourtSelect(e) {
    const id = e.target.value;
    if (id === 'custom') {
      set('court_id', ''); set('court_name', '');
    } else {
      const c = courts.find(c => c.id === parseInt(id));
      if (c) setForm(f => ({ ...f, court_id: c.id, court_name: c.name, district: c.district, city: c.city }));
    }
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
        <Link to="/" className="create-back-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Quay lại
        </Link>
        <div className="create-page-logo">
          <span>🏸</span> EasyFind
        </div>
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
                  <div className="form-group">
                    <label className="form-label">CHỌN SÂN CÓ SẴN</label>
                    <select className="form-select" value={form.court_id || 'custom'} onChange={handleCourtSelect}>
                      <option value="custom">-- Nhập sân mới --</option>
                      {filteredCourts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {!form.court_id && (
                  <div className="form-group">
                    <label className="form-label">TÊN SÂN (NHẬP MỚI)</label>
                    <input className="form-input" placeholder="VD: Sân Cầu Lông Hoàng Anh"
                      value={form.court_name} onChange={e => set('court_name', e.target.value)} />
                  </div>
                )}
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
                    {(BANKS || ['Vietcombank', 'Techcombank', 'MB Bank', 'BIDV', 'Agribank', 'VPBank', 'ACB', 'TPBank']).map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
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
