// src/pages/CreateMatchPage.jsx - Full page version of Create Match
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { SKILL_LEVELS, CITIES, HN_DISTRICTS, HCM_DISTRICTS, DN_DISTRICTS, SHUTTLECOCKS, BANKS, fmtTime } from '../utils/helpers';
import LogoIcon from '../components/LogoIcon';
import AIForensicReport from '../components/AIForensicReport';

const districtMap = { 'Hà Nội': HN_DISTRICTS, 'TP.HCM': HCM_DISTRICTS, 'Đà Nẵng': DN_DISTRICTS };

const defaultForm = {
  title: '', host_name: '', host_phone: '', court_name: '', court_id: '',
  city: 'Hà Nội', district: '', play_date: '', start_time: '', end_time: '',
  max_slots: 10, cost_per_slot: 60000, shuttlecock: 'Ba Sao',
  skill_levels: ['Tất cả trình độ'], note: '',
  bank_name: '', bank_account: '', bank_owner: '',
};

const STEPS = [
  { num: 1, label: 'Cơ bản' },
  { num: 2, label: 'Chi tiết' },
];

export default function CreateMatchPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ...defaultForm,
    play_date:    new Date().toISOString().split('T')[0],
    host_name:    user?.full_name || '',
    host_phone:   user?.phone || '',
  });
  const [courts, setCourts] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Court search state
  const [courtSearch, setCourtSearch] = useState('');
  const [courtDropOpen, setCourtDropOpen] = useState(false);
  const [proofVerified, setProofVerified] = useState(false);
  const [proofScanning, setProofScanning] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  useEffect(() => {
    if (!user) {
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
    if (step < 2) {
      setStep(s => s + 1);
      return;
    }
    setLoading(true); setMsg(null);
    try {
      const generatedTitle = `Giao lưu ${form.court_name || 'Cầu Lông'} (${fmtTime(form.start_time)} - ${fmtTime(form.end_time)})`;
      const payload = {
        ...form,
        title: form.title || generatedTitle,
        court_id: form.court_id ? parseInt(form.court_id) : null,
        max_slots: parseInt(form.max_slots),
        cost_per_slot: parseFloat(form.cost_per_slot) || 0,
        skill_level: (form.skill_levels || ['Tất cả trình độ']).join(', '),
      };
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
        <Link to="/" className="create-page-logo" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <LogoIcon size={28} />
          <span>EasyFind</span>
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
                {/* ── Court search ── */}
                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label">TÊN SÂN HOẶC ĐỊA CHỈ *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Gõ tên sân hoặc đường/phường/quận để tìm..."
                      value={courtSearch || form.court_name}
                      onChange={e => handleCourtSearchChange(e.target.value)}
                      onFocus={() => setCourtDropOpen(true)}
                      onBlur={() => {
                        setTimeout(() => {
                          setCourtDropOpen(false);
                          if (courtSearch) set('court_name', courtSearch);
                        }, 150);
                      }}
                    />
                    {(courtSearch || form.court_name) && (
                      <button type="button" onClick={handleCourtClear}
                        style={{
                          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--text-muted)', fontSize: '0.9rem'
                        }}>✕</button>
                    )}
                  </div>

                  {/* Dropdown gợi ý (Tìm theo tên sân HOẶC địa chỉ/quận) */}
                  {courtDropOpen && (() => {
                    const term = (courtSearch || '').toLowerCase().trim();
                    const filtered = courts.filter(c =>
                      !term ||
                      c.name.toLowerCase().includes(term) ||
                      (c.address && c.address.toLowerCase().includes(term)) ||
                      (c.district && c.district.toLowerCase().includes(term))
                    );
                    if (filtered.length === 0) return null;
                    return (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                        background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                        borderRadius: 'var(--r-sm)', boxShadow: 'var(--shadow-md)',
                        maxHeight: 220, overflowY: 'auto', marginTop: 4,
                      }}>
                        {filtered.map(c => (
                          <div key={c.id} onClick={() => handleCourtSelect(c)}
                            onMouseDown={e => e.preventDefault()}
                            style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ fontWeight: 600 }}>{c.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              📍 {c.address || [c.district, c.city].filter(Boolean).join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Sân có sẵn trong DB: hiện địa chỉ + link Google Maps */}
                  {form.court_id && (() => {
                    const court = courts.find(c => c.id === form.court_id);
                    if (!court) return null;
                    const addr = court.address || [court.district, court.city].filter(Boolean).join(', ');
                    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(court.name + ' ' + addr)}`;
                    return (
                      <div style={{
                        marginTop: 8, padding: '10px 14px', borderRadius: 8,
                        background: 'var(--brand-light)', border: '1px solid var(--brand-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                      }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>{court.name}</div>
                          <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', marginTop: 2 }}>{addr}</div>
                        </div>
                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                          style={{
                            flexShrink: 0, fontSize: '0.78rem', fontWeight: 600,
                            color: 'var(--brand)', textDecoration: 'none',
                            padding: '5px 12px', border: '1px solid var(--brand-border)',
                            borderRadius: 6, background: 'var(--bg-surface)',
                          }}>Xem Maps ↗</a>
                      </div>
                    );
                  })()}

                  {/* Sân không có trong DB: hiện input địa chỉ tự nhập */}
                  {!form.court_id && form.court_name && (
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Địa chỉ sân (tùy chọn)"
                      value={form.court_address || ''}
                      onChange={e => set('court_address', e.target.value)}
                      style={{ marginTop: 8 }}
                    />
                  )}
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

                {/* ── Khung giờ ── */}
                <div className="form-group">
                  <label className="form-label">KHUNG GIỜ CHƠI *</label>

                  {/* Nút chọn nhanh khung giờ phổ biến */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {[
                      { label: '06:00 - 08:00', start: '06:00', end: '08:00' },
                      { label: '08:00 - 10:00', start: '08:00', end: '10:00' },
                      { label: '17:00 - 19:00', start: '17:00', end: '19:00' },
                      { label: '18:00 - 20:00', start: '18:00', end: '20:00' },
                      { label: '19:00 - 21:00', start: '19:00', end: '21:00' },
                      { label: '19:30 - 21:30', start: '19:30', end: '21:30' },
                      { label: '20:00 - 22:00', start: '20:00', end: '22:00' },
                    ].map(preset => {
                      const isActive = form.start_time === preset.start && form.end_time === preset.end;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            set('start_time', preset.start);
                            set('end_time', preset.end);
                          }}
                          style={{
                            padding: '6px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600,
                            border: isActive ? '1px solid var(--brand)' : '1px solid var(--border-color)',
                            background: isActive ? 'var(--brand-light)' : 'var(--bg-surface)',
                            color: isActive ? 'var(--brand)' : 'var(--text-main)',
                            cursor: 'pointer', transition: 'all 0.15s'
                          }}
                        >
                          ⚡ {preset.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Bộ chọn giờ dạng Dropdown responsive */}
                  <div className="auth-grid-2">
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>GIỜ BẮT ĐẦU</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <select
                          className="form-input"
                          style={{ flex: 1, paddingRight: 4, fontWeight: 600 }}
                          value={(form.start_time || '18:00').split(':')[0]}
                          onChange={e => {
                            const mm = (form.start_time || '18:00').split(':')[1] || '00';
                            set('start_time', `${e.target.value.padStart(2, '0')}:${mm}`);
                          }}
                        >
                          {Array.from({ length: 24 }, (_, i) => {
                            const hh = i.toString().padStart(2, '0');
                            return <option key={hh} value={hh}>{hh}h</option>;
                          })}
                        </select>
                        <select
                          className="form-input"
                          style={{ width: 80, fontWeight: 600 }}
                          value={(form.start_time || '18:00').split(':')[1] || '00'}
                          onChange={e => {
                            const hh = (form.start_time || '18:00').split(':')[0] || '18';
                            set('start_time', `${hh}:${e.target.value}`);
                          }}
                        >
                          {['00', '15', '30', '45'].map(m => (
                            <option key={m} value={m}>:{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>GIỜ KẾT THÚC</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <select
                          className="form-input"
                          style={{ flex: 1, paddingRight: 4, fontWeight: 600 }}
                          value={(form.end_time || '20:00').split(':')[0]}
                          onChange={e => {
                            const mm = (form.end_time || '20:00').split(':')[1] || '00';
                            set('end_time', `${e.target.value.padStart(2, '0')}:${mm}`);
                          }}
                        >
                          {Array.from({ length: 24 }, (_, i) => {
                            const hh = i.toString().padStart(2, '0');
                            return <option key={hh} value={hh}>{hh}h</option>;
                          })}
                        </select>
                        <select
                          className="form-input"
                          style={{ width: 80, fontWeight: 600 }}
                          value={(form.end_time || '20:00').split(':')[1] || '00'}
                          onChange={e => {
                            const hh = (form.end_time || '20:00').split(':')[0] || '20';
                            set('end_time', `${hh}:${e.target.value}`);
                          }}
                        >
                          {['00', '15', '30', '45'].map(m => (
                            <option key={m} value={m}>:{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Phân bổ Suất & Giá Tiền ── */}
                <div className="form-group" style={{ background: 'var(--bg-subtle)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <label className="form-label" style={{ margin: 0 }}>CẤU HÌNH SUẤT & GIÁ TIỀN *</label>
                    <div style={{ display: 'flex', gap: 4, background: 'var(--bg-surface)', padding: 3, borderRadius: 6, border: '1px solid var(--border-color)' }}>
                      <button
                        type="button"
                        onClick={() => set('enable_categories', false)}
                        style={{
                          padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, borderRadius: 4, border: 'none',
                          background: !form.enable_categories ? 'var(--brand)' : 'transparent',
                          color: !form.enable_categories ? '#fff' : 'var(--text-muted)', cursor: 'pointer'
                        }}
                      >
                        Đồng giá chung
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          set('enable_categories', true);
                          if (!form.slot_categories || form.slot_categories.length === 0) {
                            set('slot_categories', [
                              { id: '1', gender: 'male', skill_level: 'Trung bình', slots: 3, cost: 70000 },
                              { id: '2', gender: 'female', skill_level: 'Mới chơi', slots: 2, cost: 30000 },
                            ]);
                          }
                        }}
                        style={{
                          padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, borderRadius: 4, border: 'none',
                          background: form.enable_categories ? 'var(--brand)' : 'transparent',
                          color: form.enable_categories ? '#fff' : 'var(--text-muted)', cursor: 'pointer'
                        }}
                      >
                        ⚡ Phân bổ Nam/Nữ riêng
                      </button>
                    </div>
                  </div>

                  {!form.enable_categories ? (
                    /* ── Chế độ 1: Đồng giá chung ── */
                    <div className="auth-grid-2">
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>SỐ SUẤT TỐI ĐA</span>
                        <input type="number" className="form-input" required min={2} max={50} step={1}
                          value={form.max_slots}
                          onChange={e => set('max_slots', Math.round(Math.abs(parseInt(e.target.value) || 2)))}
                          onKeyDown={e => ['.', ',', 'e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>GIÁ / NGƯỜI (VNĐ)</span>
                        <input type="number" className="form-input" required min={0} step={5000}
                          value={form.cost_per_slot} onChange={e => set('cost_per_slot', e.target.value)} />
                      </div>
                    </div>
                  ) : (
                    /* ── Chế độ 2: Phân bổ chi tiết Nam/Nữ & Giá riêng ── */
                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                        {(form.slot_categories || []).map((cat, idx) => (
                          <div key={cat.id || idx} style={{
                            background: 'var(--bg-surface)', padding: '12px', borderRadius: 8, border: '1px solid var(--border-color)',
                            position: 'relative', display: 'flex', flexDirection: 'column', gap: 8
                          }}>
                            {/* Nút xóa nhóm */}
                            <button type="button" onClick={() => {
                              const next = form.slot_categories.filter((_, i) => i !== idx);
                              set('slot_categories', next);
                              const total = next.reduce((sum, c) => sum + (parseInt(c.slots) || 0), 0);
                              set('max_slots', total || 1);
                            }}
                              style={{
                                position: 'absolute', right: 8, top: 8, background: '#FEF2F2', border: '1px solid #FECACA',
                                color: '#EF4444', width: 26, height: 26, borderRadius: '50%', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', cursor: 'pointer'
                              }}
                            >✕</button>

                            {/* Hàng 1: Đối tượng & Trình độ */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 8, paddingRight: 28 }}>
                              <div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 2 }}>ĐỐI TƯỢNG</span>
                                <select className="form-input" style={{ padding: '6px 8px', fontSize: '0.8rem', fontWeight: 600 }}
                                  value={cat.gender}
                                  onChange={e => {
                                    const next = [...form.slot_categories];
                                    next[idx].gender = e.target.value;
                                    set('slot_categories', next);
                                  }}
                                >
                                  <option value="male">♂ Nam</option>
                                  <option value="female">♀ Nữ</option>
                                  <option value="mixed">👫 Nam & Nữ</option>
                                </select>
                              </div>

                              <div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 2 }}>TRÌNH ĐỘ</span>
                                <select className="form-input" style={{ padding: '6px 8px', fontSize: '0.8rem', fontWeight: 600 }}
                                  value={cat.skill_level}
                                  onChange={e => {
                                    const next = [...form.slot_categories];
                                    next[idx].skill_level = e.target.value;
                                    set('slot_categories', next);
                                  }}
                                >
                                  {['Tất cả trình độ', 'Mới chơi', 'Yếu', 'Trung bình yếu', 'Trung bình', 'Trung bình khá', 'Khá'].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Hàng 2: Số suất & Giá tiền */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 8 }}>
                              <div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 2 }}>SỐ SUẤT</span>
                                <input type="number" className="form-input" min={1} max={30} style={{ padding: '6px 8px', fontSize: '0.85rem', fontWeight: 700 }}
                                  value={cat.slots}
                                  onChange={e => {
                                    const next = [...form.slot_categories];
                                    next[idx].slots = Math.max(1, parseInt(e.target.value) || 1);
                                    set('slot_categories', next);
                                    const total = next.reduce((sum, c) => sum + (parseInt(c.slots) || 0), 0);
                                    set('max_slots', total);
                                  }}
                                />
                              </div>

                              <div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 2 }}>GIÁ / NGƯỜI (VNĐ)</span>
                                <input type="number" className="form-input" step={5000} min={0} style={{ padding: '6px 8px', fontSize: '0.85rem', fontWeight: 700 }}
                                  value={cat.cost}
                                  onChange={e => {
                                    const next = [...form.slot_categories];
                                    next[idx].cost = parseFloat(e.target.value) || 0;
                                    set('slot_categories', next);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const next = [
                            ...(form.slot_categories || []),
                            { id: Date.now().toString(), gender: 'female', skill_level: 'Mới chơi', slots: 2, cost: 30000 }
                          ];
                          set('slot_categories', next);
                          const total = next.reduce((sum, c) => sum + (parseInt(c.slots) || 0), 0);
                          set('max_slots', total);
                        }}
                        style={{
                          width: '100%', padding: '10px', fontSize: '0.82rem', fontWeight: 600,
                          background: 'var(--bg-surface)', border: '1px dashed var(--brand)',
                          color: 'var(--brand)', borderRadius: 6, cursor: 'pointer'
                        }}
                      >
                        + Thêm nhóm suất phân bổ
                      </button>

                      <div style={{ marginTop: 10, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', fontWeight: 600, flexWrap: 'wrap', gap: 6 }}>
                        <span>Tổng cộng: <strong style={{ color: 'var(--brand)' }}>{(form.slot_categories || []).reduce((s, c) => s + (parseInt(c.slots) || 0), 0)} suất</strong></span>
                        <span>Mức giá từ: <strong style={{ color: 'var(--brand)' }}>{Math.min(...(form.slot_categories || []).map(c => c.cost || 0)).toLocaleString('vi-VN')}đ - {Math.max(...(form.slot_categories || []).map(c => c.cost || 0)).toLocaleString('vi-VN')}đ</strong></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Chỉ hiển thị Chọn Trình Độ Yêu Cầu chung khi ở chế độ Đồng Giá Chung ── */}
                {!form.enable_categories && (
                  <div className="form-group">
                    <label className="form-label">TRÌNH ĐỘ YÊU CẦU <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>(chọn nhiều)</span></label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                      {['Tất cả trình độ', ...SKILL_LEVELS].map(s => {
                        const isAll = s === 'Tất cả trình độ';
                        const checked = (form.skill_levels || []).includes(s);
                        return (
                          <label
                            key={s}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              padding: '6px 14px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600,
                              border: checked ? '1px solid var(--brand)' : '1px solid var(--border-color)',
                              background: checked ? 'var(--brand-light)' : 'var(--bg-surface)',
                              color: checked ? 'var(--brand)' : 'var(--text-sub)', cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              style={{ accentColor: 'var(--brand)', width: 14, height: 14, cursor: 'pointer' }}
                              onChange={() => {
                                if (isAll) {
                                  set('skill_levels', ['Tất cả trình độ']);
                                } else {
                                  setForm(f => {
                                    let next = (f.skill_levels || []).filter(x => x !== 'Tất cả trình độ');
                                    if (next.includes(s)) {
                                      next = next.filter(x => x !== s);
                                    } else {
                                      next = [...next, s];
                                    }
                                    return { ...f, skill_levels: next.length ? next : ['Tất cả trình độ'] };
                                  });
                                }
                              }}
                            />
                            {s}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">LOẠI CẦU</label>
                  <select className="form-select" value={form.shuttlecock} onChange={e => set('shuttlecock', e.target.value)}>
                    {(SHUTTLECOCKS || ['Ba Sao', 'Yonex Aerosensa', 'Victor NS']).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">GHI CHÚ THÊM</label>
                  <textarea className="form-input" rows={3} placeholder="Thông tin thêm về kèo, yêu cầu đặc biệt..."
                    value={form.note} onChange={e => set('note', e.target.value)} style={{ resize: 'vertical' }} />
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

              {step < 2 ? (
                <button type="button" className="create-btn-next" onClick={() => setStep(s => s + 1)}>
                  Tiếp theo →
                </button>
              ) : (
                <button type="submit" className="create-btn-submit" disabled={loading}>
                  {loading ? 'Đang tạo kèo...' : 'Đăng kèo'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
