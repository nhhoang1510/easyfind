// src/pages/CreateMatchPage.jsx - Full page version of Create Match
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { SKILL_LEVELS, CITIES, HN_DISTRICTS, HCM_DISTRICTS, DN_DISTRICTS, SHUTTLECOCKS, BANKS, fmtTime } from '../utils/helpers';
import LogoIcon from '../components/LogoIcon';
import AIForensicReport from '../components/AIForensicReport';
import { MapPin } from 'lucide-react';

const districtMap = { 'Hà Nội': HN_DISTRICTS, 'TP.HCM': HCM_DISTRICTS, 'Đà Nẵng': DN_DISTRICTS };

const defaultForm = {
  title: '', host_name: '', host_phone: '', court_name: '', court_id: '', court_number: '',
  city: 'Hà Nội', district: '', play_date: '', start_time: '', end_time: '',
  max_slots: 5, cost_per_slot: 60000, shuttlecock: 'Ba Sao',
  skill_levels: ['Tất cả trình độ'], note: '', booking_proof: '',
  bank_name: '', bank_account: '', bank_owner: '',
  slot_categories: [
    { id: '1', gender: 'male', skill_level: 'Trung bình', slots: 3, cost: 70000 },
    { id: '2', gender: 'female', skill_level: 'Mới chơi', slots: 2, cost: 30000 },
  ],
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
    setLoading(true);
    setMsg(null);
    try {
      if (!form.court_name) return setMsg({ type: 'error', text: 'Vui lòng nhập hoặc chọn Tên Sân' });
      const generatedTitle = `Giao lưu ${form.court_name} (${fmtTime(form.start_time || '18:00')} - ${fmtTime(form.end_time || '20:00')})`;
      const payload = {
        ...form,
        title: form.title || generatedTitle,
        district: form.district || 'Hai Bà Trưng',
        start_time: form.start_time || '18:00',
        end_time: form.end_time || '20:00',
        court_id: form.court_id ? parseInt(form.court_id) : null,
        max_slots: parseInt(form.max_slots) || 10,
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
          <p className="create-page-sub">Nhập thông tin sân, giờ đánh và số lượng để tuyển quân ngay!</p>
        </div>

        {/* Card */}
        <div className="create-card">
          {msg && (
            <div className={`auth-alert ${msg.type === 'error' ? 'auth-alert--error' : 'auth-alert--success'}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="create-form-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* ── 1. Tên Sân ── */}
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">TÊN SÂN HOẶC ĐỊA CHỈ *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Gõ tên sân hoặc đường/quận..."
                    value={courtSearch || form.court_name}
                    onChange={e => handleCourtSearchChange(e.target.value)}
                    onFocus={() => setCourtDropOpen(true)}
                    onBlur={() => {
                      setTimeout(() => {
                        setCourtDropOpen(false);
                        if (courtSearch) set('court_name', courtSearch);
                      }, 200);
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

                {/* Dropdown Gợi Ý Tên Sân */}
                {courtDropOpen && (() => {
                  const term = (courtSearch || form.court_name || '').toLowerCase().trim();
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
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <MapPin size={13} style={{ flexShrink: 0 }} />
                            <span>{c.address || [c.district, c.city].filter(Boolean).join(', ')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="form-label">SỐ SÂN CỤ THỂ (VD: Sân 3, Sân 5 & 6...)</label>
                <input className="form-input" placeholder="VD: Sân 3 hoặc Sân A2"
                  value={form.court_number || ''} onChange={e => set('court_number', e.target.value)} />
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
                <label className="form-label">NGÀY CHƠI *</label>
                <input type="date" className="form-input" required min={new Date().toISOString().split('T')[0]}
                  value={form.play_date} onChange={e => set('play_date', e.target.value)} />
              </div>

                {/* ── Khung giờ ── */}
                <div className="form-group">
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
                            return <option key={hh} value={hh}>{hh}</option>;
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
                            return <option key={hh} value={hh}>{hh}</option>;
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

                {/* ── Suất & Giá Tiền Chi Tiết (Phân bổ Theo Nhóm) ── */}
                <div className="form-group">
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
                              title="Xóa nhóm suất"
                              style={{
                                position: 'absolute', right: 10, top: 10, background: '#FEF2F2', border: '1px solid #FCA5A5',
                                color: '#EF4444', width: 22, height: 22, borderRadius: '50%', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                                padding: 0, lineHeight: 1
                              }}
                            >✕</button>

                            {/* Hàng 1: Đối tượng */}
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
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="mixed">Nam & Nữ</option>
                              </select>
                            </div>

                            {/* Trình độ */}
                            <div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>TRÌNH ĐỘ</span>
                              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {['Mới chơi', 'Yếu', 'TB yếu', 'Trung bình', 'TB khá', 'Khá'].map(s => {
                                  const levels = (cat.skill_level || '').split(',').map(x => x.trim()).filter(Boolean);
                                  const isSelected = levels.includes(s) || cat.skill_level === s;
                                  return (
                                    <button
                                      key={s}
                                      type="button"
                                      onClick={() => {
                                        let current = (cat.skill_level || '').split(',').map(x => x.trim()).filter(Boolean);
                                        if (current.includes(s)) {
                                          current = current.filter(x => x !== s);
                                        } else {
                                          current.push(s);
                                        }
                                        const newSkillStr = current.length > 0 ? current.join(', ') : 'Trung bình';
                                        const next = [...form.slot_categories];
                                        next[idx].skill_level = newSkillStr;
                                        set('slot_categories', next);
                                      }}
                                      style={{
                                        padding: '3px 8px', borderRadius: 100, fontSize: '0.73rem', fontWeight: 600,
                                        border: isSelected ? '1px solid var(--brand)' : '1px solid var(--border-color)',
                                        background: isSelected ? 'var(--brand-light)' : 'var(--bg-surface)',
                                        color: isSelected ? 'var(--brand)' : 'var(--text-sub)', cursor: 'pointer',
                                        transition: 'all 0.12s'
                                      }}
                                    >
                                      {isSelected ? '✓ ' : ''}{s}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Hàng 2: Số lượng & Giá/người */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 8 }}>
                              <div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 2 }}>SỐ LƯỢNG</span>
                                <input type="number" className="form-input" min={1} max={30} style={{ padding: '6px 8px', fontSize: '0.85rem', fontWeight: 700 }}
                                  value={cat.slots}
                                  onChange={e => {
                                    const raw = e.target.value;
                                    const next = [...form.slot_categories];
                                    next[idx].slots = raw === '' ? '' : Math.max(0, parseInt(raw) || 0);
                                    set('slot_categories', next);
                                    const total = next.reduce((sum, c) => sum + (parseInt(c.slots) || 0), 0);
                                    set('max_slots', total);
                                  }}
                                />
                              </div>

                              <div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 2 }}>GIÁ / NGƯỜI</span>
                                <input type="number" className="form-input" step={5000} min={0} style={{ padding: '6px 8px', fontSize: '0.85rem', fontWeight: 700 }}
                                  value={cat.cost}
                                  onChange={e => {
                                    const raw = e.target.value;
                                    const next = [...form.slot_categories];
                                    next[idx].cost = raw === '' ? '' : Math.max(0, parseFloat(raw) || 0);
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
                        + Thêm suất Nam/Nữ
                      </button>

                      <div style={{
                        marginTop: 12, padding: '10px 12px', background: 'var(--brand-light)', border: '1px solid var(--brand-border)',
                        borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600
                      }}>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          {(form.slot_categories || []).map((c, i) => (
                            <span key={i} style={{ color: c.gender === 'female' ? '#E11D48' : '#1D4ED8' }}>
                              • {c.slots} {c.gender === 'female' ? 'Nữ' : c.gender === 'male' ? 'Nam' : 'Nam/Nữ'} ({c.cost ? c.cost.toLocaleString('vi-VN') + 'đ/suất' : 'Miễn phí'})
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                </div>
                <div className="form-group">
                  <label className="form-label">LOẠI CẦU</label>
                  <select className="form-select"
                    value={(SHUTTLECOCKS || ['Ba Sao', 'Hải Yến', 'Victor', 'Yonex']).includes(form.shuttlecock) ? form.shuttlecock : 'other'}
                    onChange={e => {
                      const v = e.target.value;
                      if (v === 'other') {
                        set('shuttlecock', form.custom_shuttlecock || '');
                        set('is_custom_shuttlecock', true);
                      } else {
                        set('shuttlecock', v);
                        set('is_custom_shuttlecock', false);
                      }
                    }}
                  >
                    {['Ba Sao', 'Hải Yến', 'Victor', 'Yonex', 'Pro Kennex', 'Thành Công'].map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="other">Khác (Nhập tên loại cầu)...</option>
                  </select>

                  {(form.is_custom_shuttlecock || !(SHUTTLECOCKS || ['Ba Sao', 'Hải Yến', 'Victor', 'Yonex']).includes(form.shuttlecock)) && (
                    <input
                      type="text"
                      className="form-input"
                      style={{ marginTop: 8 }}
                      placeholder="Nhập tên loại cầu bạn dùng (VD: Cầu Hải Yến, Cầu Nhựa...)"
                      value={form.custom_shuttlecock !== undefined ? form.custom_shuttlecock : form.shuttlecock}
                      onChange={e => {
                        set('custom_shuttlecock', e.target.value);
                        set('shuttlecock', e.target.value);
                      }}
                    />
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">GHI CHÚ THÊM</label>
                  <textarea className="form-input" rows={2} placeholder="Thông tin thêm về kèo, yêu cầu đặc biệt..."
                    value={form.note} onChange={e => set('note', e.target.value)} style={{ resize: 'vertical' }} />
                </div>

              {/* Submit button */}
              <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                <Link to="/" className="create-btn-back" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>Huỷ</Link>
                <button type="submit" className="create-btn-submit" style={{ flex: 2 }} disabled={loading}>
                  {loading ? 'Đang tạo kèo...' : 'Đăng kèo'}
                </button>
              </div>
          </form>
        </div>
      </div>
    </div>
  );
}
