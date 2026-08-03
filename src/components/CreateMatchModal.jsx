// src/components/CreateMatchModal.jsx
import { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { SKILL_LEVELS, CITIES, HN_DISTRICTS, HCM_DISTRICTS, DN_DISTRICTS, SHUTTLECOCKS, BANKS } from '../utils/helpers';
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

export default function CreateMatchModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    ...defaultForm,
    play_date: new Date().toISOString().split('T')[0],
    host_name: user?.full_name || '',
    host_phone: user?.phone || '',
  });
  const [courts, setCourts] = useState([]);
  const [step, setStep] = useState(1); // 1=basic, 2=details, 3=payment
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api.getCourts().then(setCourts).catch(() => { });
  }, []);

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v, ...(k === 'city' ? { district: '', court_id: '', court_name: '' } : {}) }));
  }

  function handleCourtSelect(e) {
    const id = e.target.value;
    if (id === 'custom') {
      set('court_id', ''); set('court_name', '');
    } else {
      const c = courts.find(c => c.id === parseInt(id));
      if (c) { setForm(f => ({ ...f, court_id: c.id, court_name: c.name, district: c.district, city: c.city })); }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      const sanitizedCategories = (form.slot_categories || []).map(c => ({
        ...c,
        slots: Math.max(1, parseInt(c.slots) || 1),
        cost: Math.max(0, parseFloat(c.cost) || 0)
      }));
      const totalSlots = sanitizedCategories.reduce((sum, c) => sum + c.slots, 0);

      const payload = {
        ...form,
        slot_categories: sanitizedCategories,
        max_slots: totalSlots || parseInt(form.max_slots) || 1,
        cost_per_slot: parseFloat(form.cost_per_slot) || 0,
        skill_level: form.skill_levels.join(', '), // string cho API
      };
      const created = await api.createMatch(payload);
      onCreated(created);
      onClose();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  const districts = districtMap[form.city] || [];
  const filteredCourts = courts.filter(c => !form.city || c.city === form.city);

  const stepLabels = ['📋 Cơ Bản', '⚙️ Chi Tiết', '💳 Thanh Toán'];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 600 }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F0F6FF' }}>🏸 Tạo Kèo Mới</h2>
            <p style={{ fontSize: '0.82rem', color: '#5B7A99', marginTop: 4 }}>Chỉ mất 2 phút để tạo kèo và chia sẻ với anh em!</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 0, padding: '12px 28px 0' }}>
          {stepLabels.map((label, idx) => {
            const n = idx + 1;
            const isActive = step === n;
            const isDone = step > n;
            return (
              <div key={n} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <div
                  onClick={() => isDone && setStep(n)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                    cursor: isDone ? 'pointer' : 'default',
                  }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.78rem',
                    background: isDone ? 'rgba(0,245,196,0.15)' : isActive ? 'linear-gradient(135deg,#00F5C4,#AAFF00)' : 'rgba(255,255,255,0.05)',
                    color: isDone ? '#00F5C4' : isActive ? '#0A0E1A' : '#5B7A99',
                    border: isDone ? '1px solid rgba(0,245,196,0.3)' : isActive ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  }}>{isDone ? '✓' : n}</div>
                  <span style={{ fontSize: '0.75rem', color: isActive ? '#F0F6FF' : '#5B7A99', fontWeight: isActive ? 600 : 400 }}>{label}</span>
                </div>
                {idx < 2 && <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 8px' }} />}
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {msg && (
              <div style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', fontSize: '0.85rem' }}>
                {msg.text}
              </div>
            )}

            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <>
                <div className="form-group">
                  <label className="form-label">Tiêu đề kèo <span>*</span></label>
                  <input id="create-title" className="form-input" required value={form.title} onChange={e => set('title', e.target.value)} placeholder="VD: Kèo Chiều Thứ 4 Đống Đa - Trung Bình" />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Tên Host <span>*</span></label>
                    <input id="create-host-name" className="form-input" required value={form.host_name} onChange={e => set('host_name', e.target.value)} placeholder="Nguyễn Văn A" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SĐT / Zalo của Host</label>
                    <input id="create-host-phone" className="form-input" value={form.host_phone} onChange={e => set('host_phone', e.target.value)} placeholder="0912 345 678" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Thành phố <span>*</span></label>
                  <select id="create-city" className="form-select" value={form.city} onChange={e => set('city', e.target.value)}>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Quận / Huyện</label>
                    <select id="create-district" className="form-select" value={form.district} onChange={e => set('district', e.target.value)}>
                      <option value="">-- Chọn quận/huyện --</option>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Chọn Sân Có Sẵn</label>
                    <select id="create-court" className="form-select" value={form.court_id || 'custom'} onChange={handleCourtSelect}>
                      <option value="custom">-- Nhập sân mới --</option>
                      {filteredCourts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {!form.court_id && (
                  <div className="form-group">
                    <label className="form-label">Tên sân (nhập mới)</label>
                    <input id="create-court-name" className="form-input" value={form.court_name} onChange={e => set('court_name', e.target.value)} placeholder="VD: Sân Cầu Lông Hoàng Anh" />
                  </div>
                )}
              </>
            )}

            {/* STEP 2: Match Details */}
            {step === 2 && (
              <>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Ngày chơi <span>*</span></label>
                    <input id="create-date" className="form-input" type="date" required value={form.play_date} onChange={e => set('play_date', e.target.value)} min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Loại cầu</label>
                    <select id="create-shuttle" className="form-select" value={form.shuttlecock} onChange={e => set('shuttlecock', e.target.value)}>
                      {SHUTTLECOCKS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Giờ bắt đầu <span>*</span></label>
                    <input
                      id="create-start" className="form-input" type="time" required
                      value={form.start_time}
                      onChange={e => set('start_time', e.target.value)}
                      lang="vi" data-time-format="HH:mm"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Giờ kết thúc <span>*</span></label>
                    <input
                      id="create-end" className="form-input" type="time" required
                      value={form.end_time}
                      onChange={e => set('end_time', e.target.value)}
                      lang="vi" data-time-format="HH:mm"
                    />
                  </div>
                </div>

                {/* ── Phân bổ Nhóm Suất & Chi Phí ── */}
                <div className="form-group">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
                    {(form.slot_categories || []).map((cat, idx) => (
                      <div key={cat.id || idx} style={{
                        background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
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
                          <span style={{ fontSize: '0.7rem', color: '#9DB4CC', fontWeight: 600, display: 'block', marginBottom: 2, textTransform: 'uppercase' }}>ĐỐI TƯỢNG</span>
                          <select className="form-select" style={{ padding: '6px 8px', fontSize: '0.82rem', fontWeight: 600 }}
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
                          <span style={{ fontSize: '0.7rem', color: '#9DB4CC', fontWeight: 600, display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>TRÌNH ĐỘ</span>
                          <MultiSelectSkillDropdown
                            value={cat.skill_level}
                            onChange={newStr => {
                              const next = [...form.slot_categories];
                              next[idx].skill_level = newStr;
                              set('slot_categories', next);
                            }}
                          />
                        </div>

                        {/* Hàng 2: Số lượng & Giá/người */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 8 }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: '#9DB4CC', fontWeight: 600, display: 'block', marginBottom: 2, textTransform: 'uppercase' }}>SỐ LƯỢNG</span>
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
                            <span style={{ fontSize: '0.7rem', color: '#9DB4CC', fontWeight: 600, display: 'block', marginBottom: 2, textTransform: 'uppercase' }}>GIÁ / NGƯỜI</span>
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
                      width: '100%', padding: '9px', fontSize: '0.82rem', fontWeight: 600,
                      background: 'rgba(0,245,196,0.06)', border: '1px dashed #00F5C4',
                      color: '#00F5C4', borderRadius: 8, cursor: 'pointer'
                    }}
                  >
                    + Thêm nhóm suất Nam/Nữ
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">Trình độ yêu cầu <span style={{ fontSize: '0.75rem', color: '#5B7A99', fontWeight: 400 }}>(chọn nhiều)</span></label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {SKILL_LEVELS.map(s => {
                      const isAll = s === 'Tất cả trình độ';
                      const checked = form.skill_levels.includes(s);
                      return (
                        <label
                          key={s}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '6px 14px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600,
                            border: checked ? '1px solid #00F5C4' : '1px solid rgba(255,255,255,0.08)',
                            background: checked ? 'rgba(0,245,196,0.12)' : 'rgba(255,255,255,0.04)',
                            color: checked ? '#00F5C4' : '#9DB4CC', cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            style={{ accentColor: '#00F5C4', width: 14, height: 14, cursor: 'pointer' }}
                            onChange={() => {
                              if (isAll) {
                                // Nếu click "Tất cả trình độ", bỏ hết cái khác, chỉ giữ nó
                                set('skill_levels', ['Tất cả trình độ']);
                              } else {
                                setForm(f => {
                                  let next = f.skill_levels.filter(x => x !== 'Tất cả trình độ'); // bỏ "Tất cả"
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

                <div className="form-group">
                  <label className="form-label">Ghi chú thêm</label>
                  <textarea id="create-note" className="form-textarea" value={form.note} onChange={e => set('note', e.target.value)} placeholder="VD: Có chỗ để xe miễn phí. Mang theo nước uống..." rows={3} />
                </div>
              </>
            )}

            {/* STEP 3: Payment / Bank */}
            {step === 3 && (
              <>
                <div style={{ background: 'rgba(0,245,196,0.04)', border: '1px solid rgba(0,245,196,0.12)', borderRadius: 12, padding: '12px 16px', marginBottom: 4 }}>
                  <p style={{ fontSize: '0.85rem', color: '#9DB4CC', fontWeight: 600 }}>💡 Thiết lập tài khoản nhận cọc</p>
                  <p style={{ fontSize: '0.8rem', color: '#5B7A99', marginTop: 4 }}>
                    Người chơi sẽ chuyển khoản trước để đảm bảo không bùng kèo. Mã QR sẽ được tự động tạo.
                  </p>
                </div>
                <div className="form-group">
                  <label className="form-label">Ngân hàng</label>
                  <select id="create-bank-name" className="form-select" value={form.bank_name} onChange={e => set('bank_name', e.target.value)}>
                    <option value="">-- Chọn ngân hàng --</option>
                    {BANKS.map(b => <option key={b.code} value={b.name}>{b.name}</option>)}
                  </select>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Số tài khoản</label>
                    <input id="create-bank-acc" className="form-input" value={form.bank_account} onChange={e => set('bank_account', e.target.value)} placeholder="123456789" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tên chủ tài khoản</label>
                    <input id="create-bank-owner" className="form-input" value={form.bank_owner} onChange={e => set('bank_owner', e.target.value.toUpperCase())} placeholder="NGUYEN VAN A" />
                  </div>
                </div>

                {/* Minh chứng đặt sân */}
                <div className="form-group" style={{ margin: '12px 0' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>🧾 MINH CHỨNG ĐẶT SÂN </span>
                    <span style={{ fontSize: '0.75rem', color: '#5B7A99' }}>Tùy chọn</span>
                  </label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      id="create-booking-proof"
                      className="form-input"
                      value={form.booking_proof || ''}
                      onChange={e => set('booking_proof', e.target.value)}
                      placeholder="Dán link ảnh hoặc tải lên hình ảnh biên nhận đặt sân"
                    />
                    <label style={{
                      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap',
                      display: 'inline-flex', alignItems: 'center', gap: 4, color: '#E2E8F0'
                    }}>
                      📁 Tải ảnh
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => set('booking_proof', ev.target.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  {form.booking_proof && (
                    <div style={{ marginTop: 8, position: 'relative', display: 'inline-block' }}>
                      <img src={form.booking_proof} alt="Minh chứng đặt sân" style={{ maxHeight: 100, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)' }} />
                      <button
                        type="button"
                        onClick={() => set('booking_proof', '')}
                        style={{
                          position: 'absolute', top: -6, right: -6, background: '#EF4444', color: '#fff',
                          border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: '0.7rem'
                        }}
                      >✕</button>
                    </div>
                  )}
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '14px 16px' }}>
                  <p style={{ fontSize: '0.8rem', color: '#5B7A99', marginBottom: 8 }}>📋 Xem trước thông tin kèo</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem' }}>
                    {[
                      ['🏸', 'Tiêu đề', form.title],
                      [<MapPin key="mappin" size={14} style={{ color: '#5B7A99' }} />, 'Sân', form.court_name || 'Chưa chọn sân'],
                      ['🏟️', 'Số sân', form.court_number],
                      [<MapPin key="location" size={14} style={{ color: '#5B7A99' }} />, 'Địa điểm', `${form.district || ''} ${form.city}`],
                      ['📅', 'Ngày', form.play_date],
                      ['⏰', 'Giờ', `${form.start_time} – ${form.end_time}`],
                      ['👥', 'Số người', form.max_slots + ' suất'],
                      ['💰', 'Chi phí', form.cost_per_slot ? (parseInt(form.cost_per_slot)).toLocaleString('vi-VN') + 'đ' : 'Miễn phí'],
                      ['🎯', 'Trình độ', form.skill_levels.join(', ')],
                      ['🧾', 'Minh chứng', form.booking_proof ? 'Đã đính kèm ảnh đặt sân' : null],
                    ].map(([icon, label, value]) => value ? (
                      <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span>{icon}</span>
                        <span style={{ color: '#5B7A99', width: 70 }}>{label}:</span>
                        <span style={{ color: '#F0F6FF', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
                      </div>
                    ) : null)}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="modal-footer" style={{ display: 'flex', gap: 10 }}>
            {step > 1 && (
              <button type="button" className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>
                ← Quay lại
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < 3 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (step === 1 && (!form.title || !form.host_name)) { setMsg({ type: 'error', text: 'Vui lòng nhập đầy đủ Tiêu đề và Tên Host!' }); return; }
                  if (step === 2 && (!form.play_date || !form.start_time || !form.end_time)) { setMsg({ type: 'error', text: 'Vui lòng nhập đủ ngày, giờ bắt đầu và kết thúc!' }); return; }
                  setMsg(null); setStep(s => s + 1);
                }}
              >
                Tiếp theo →
              </button>
            ) : (
              <button id="btn-submit-create" type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? '⏳ Đang tạo...' : '🚀 Tạo Kèo Ngay!'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Component Dropdown Chọn Trình Độ Nhiều Mục Gọn Gàng Cho Mobile ── */
export function MultiSelectSkillDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const ALL_SKILLS = ['Mới chơi', 'Yếu', 'TB yếu', 'Trung bình', 'TB khá', 'Khá'];
  const selectedList = (value || '').split(',').map(x => x.trim()).filter(Boolean);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleSkill(s) {
    let next = [...selectedList];
    if (next.includes(s)) {
      next = next.filter(x => x !== s);
    } else {
      next.push(s);
    }
    const newStr = next.length > 0 ? next.join(', ') : 'Trung bình';
    onChange(newStr);
  }

  const displayText = selectedList.length > 0 ? selectedList.join(', ') : 'Chọn trình độ...';

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          padding: '8px 12px',
          fontSize: '0.82rem',
          fontWeight: 600,
          background: 'rgba(255,255,255,0.06)',
          color: selectedList.length > 0 ? '#00F5C4' : '#9DB4CC',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 8,
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedList.length > 0 ? `✓ ${displayText}` : displayText}
        </span>
        <span style={{ fontSize: '0.65rem', marginLeft: 6, color: '#9DB4CC', flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 999,
            background: '#0F172A',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
            padding: '6px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 4
          }}
        >
          {ALL_SKILLS.map(s => {
            const isSelected = selectedList.includes(s);
            return (
              <label
                key={s}
                onClick={(e) => { e.stopPropagation(); toggleSkill(s); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 8px',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected ? 'rgba(0,245,196,0.15)' : 'transparent',
                  color: isSelected ? '#00F5C4' : '#9DB4CC',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  style={{ accentColor: '#00F5C4', width: 14, height: 14, cursor: 'pointer' }}
                />
                <span>{s}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
