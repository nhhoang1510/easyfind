// src/components/MatchDetailModal.jsx - Clean Minimalist Flat Editorial Modal
import { useState, useEffect } from 'react';
import {
  fmtCurrency, fmtDate, fmtTime,
  avatarColor, avatarInitials, fmtPhone, slotPercent,
  vietQRUrl, BANKS, SKILL_LEVELS,
} from '../utils/helpers';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function MatchDetailModal({ match: initMatch, onClose, onUpdate, onShowAuth }) {
  const { user } = useAuth();
  const isHost = user && (user.role === 'host') && (user.id === initMatch.host_id || user.full_name === initMatch.host_name);

  const [match, setMatch] = useState(initMatch);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [tab, setTab] = useState('info'); // info | players | join | qr | copy
  const [form, setForm] = useState({
    player_name:  user?.full_name  || '',
    player_phone: user?.phone      || '',
    skill_level:  user?.skill_level|| '',
    note: '',
  });
  const [msg, setMsg] = useState(null);
  const [copyDone, setCopyDone] = useState(false);
  const [proofImage, setProofImage] = useState(null);
  const [currentParticipant, setCurrentParticipant] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (600 seconds) countdown

  useEffect(() => {
    if (tab === 'qr' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (tab === 'qr' && timeLeft === 0 && currentParticipant) {
      // Auto cancel after 10 mins if not paid
      handleCancel(currentParticipant.id, true);
      setTab('info');
      setMsg({ type: 'error', text: 'Đã hết 10 phút giữ chỗ! Yêu cầu đăng ký của bạn đã bị hủy tự động.' });
    }
  }, [tab, timeLeft, currentParticipant]);

  useEffect(() => {
    loadDetail();
  }, [initMatch.id]);

  async function loadDetail() {
    setLoading(true);
    try {
      const data = await api.getMatch(initMatch.id);
      setMatch(data);
    } catch (e) {
      setMsg({ type: 'error', text: 'Không thể tải thông tin kèo: ' + e.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    if (!user) { onClose(); onShowAuth && onShowAuth('login'); return; }
    if (!form.player_name.trim()) { setMsg({ type: 'error', text: 'Vui lòng nhập tên!' }); return; }
    setJoining(true); setMsg(null);
    try {
      const p = await api.joinMatch(match.id, { ...form, skill_level: form.skill_level || match.skill_level });
      setCurrentParticipant(p);
      await loadDetail();
      const isWait = p.status === 'waitlist';
      if (isWait) {
        setMsg({ type: 'success', text: `Đã vào danh sách dự bị! Bạn sẽ được thông báo khi có chỗ.` });
        setTab('players');
      } else {
        setTimeLeft(600); // 10 mins timer starts now
        setMsg({ type: 'success', text: `Đăng ký thành công! Bạn có 10 phút để chuyển khoản cọc và gửi ảnh xác nhận.` });
        setTab('qr');
      }
      setForm({ player_name: user?.full_name || '', player_phone: user?.phone || '', skill_level: user?.skill_level || '', note: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setJoining(false);
    }
  }

  async function handleCancel(pid, silent = false) {
    if (!silent && !window.confirm('Bạn có chắc muốn hủy slot này không?')) return;
    try {
      const res = await api.cancelParticipant(pid);
      await loadDetail();
      if (!silent) {
        let txt = 'Đã hủy slot thành công.';
        if (res.promoted) txt += ` ${res.promoted.player_name} đã được đôn từ danh sách dự bị!`;
        setMsg({ type: 'success', text: txt });
      }
    } catch (e) {
      if (!silent) setMsg({ type: 'error', text: e.message });
    }
  }

  async function handleDeposit(pid, status) {
    try {
      await api.updateDeposit(pid, status);
      await loadDetail();
      setMsg({ type: 'success', text: 'Đã cập nhật trạng thái cọc tiền.' });
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    }
  }

  function copyMatchText() {
    const participants = (match.participants || []).filter(p => p.status === 'confirmed');
    const playerList = participants.map((p, i) => `   ${i + 1}. ${p.player_name}${p.deposit_status === 'paid' ? ' [Đã cọc]' : ' [Chưa cọc]'}`).join('\n');
    const text = [
      `KÈO CẦU LÔNG: ${match.title.toUpperCase()}`,
      ``,
      `Sân: ${match.court_name || ''}`,
      `Khu vực: ${match.district || ''}, ${match.city || ''}`,
      `Ngày: ${fmtDate(match.play_date)}`,
      `Thời gian: ${fmtTime(match.start_time)} – ${fmtTime(match.end_time)}`,
      `Số người: ${participants.length}/${match.max_slots} suất`,
      `Chi phí: ${fmtCurrency(match.cost_per_slot)} / người`,
      `Loại cầu: ${match.shuttlecock || ''}`,
      `Trình độ: ${match.skill_level}`,
      ``,
      `Danh sách tham gia:`,
      playerList || '   Chưa có ai đăng ký',
      ``,
      match.note ? `Ghi chú: ${match.note}` : '',
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2500);
    });
  }

  const confirmed = (match.participants || []).filter(p => p.status === 'confirmed');
  const waitlisted = (match.participants || []).filter(p => p.status === 'waitlist');
  const isFull = confirmed.length >= match.max_slots;
  const pct = slotPercent(confirmed.length, match.max_slots);

  const qrUrl = match.bank_name && match.bank_account
    ? vietQRUrl({ bank: match.bank_name, accountNo: match.bank_account, accountName: match.bank_owner, amount: match.cost_per_slot, memo: `KEO ${match.id} ${form.player_phone || 'P'}` })
    : null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 640 }}>

        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ minWidth: 0, paddingRight: 16 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E11D48', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
              {match.district}, {match.city}
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>
              {match.title}
            </h2>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ fontSize: '1.2rem', padding: '4px 10px' }}>
            ✕
          </button>
        </div>

        {/* Tab switcher - Responsive Flex Wrap */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', padding: '6px 8px' }}>
          {[
            { id: 'info',    label: 'THÔNG TIN KÈO' },
            { id: 'players', label: `DANH SÁCH (${confirmed.length}/${match.max_slots})` },
            { id: 'join',    label: isFull ? 'ĐĂNG KÝ DỰ BỊ' : 'ĐĂNG KÝ NGAY' },
            { id: 'qr',      label: 'CỌC TIỀN (QR 10P)' },
            { id: 'copy',    label: 'COPY BÀI ZALO' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: '1 1 auto',
                padding: '8px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                borderRadius: 'var(--r-sm)',
                border: tab === t.id ? '1px solid var(--brand)' : '1px solid transparent',
                background: tab === t.id ? 'var(--bg-surface)' : 'transparent',
                color: tab === t.id ? 'var(--brand)' : 'var(--text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Message Banner */}
        {msg && (
          <div style={{
            margin: '16px 24px 0',
            padding: '10px 14px',
            fontSize: '0.84rem',
            background: msg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${msg.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
            color: msg.type === 'success' ? '#15803D' : '#B91C1C',
            fontWeight: 500,
          }}>
            {msg.text}
          </div>
        )}

        {/* Body Content */}
        <div className="modal-body">
          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748B' }}>Đang tải chi tiết kèo...</div>
          ) : (
            <>
              {/* TAB 1: INFO */}
              {tab === 'info' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Grid details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#F8FAFC', padding: 16, border: '1px solid #E2E8F0' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Host tổ chức</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>{match.host_name}</div>
                      {match.host_phone && <div style={{ fontSize: '0.78rem', color: '#475569' }}>SĐT: {fmtPhone(match.host_phone)}</div>}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Tên sân</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>{match.court_name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Ngày & Thời gian</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                        {fmtDate(match.play_date)} ({fmtTime(match.start_time)} – {fmtTime(match.end_time)})
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Chi phí / Suất</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#E11D48', marginTop: 2 }}>
                        {fmtCurrency(match.cost_per_slot)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Trình độ yêu cầu</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F172A', marginTop: 2 }}>{match.skill_level}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Loại cầu sử dụng</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F172A', marginTop: 2 }}>{match.shuttlecock || 'Ba Sao'}</div>
                    </div>
                  </div>

                  {/* Note */}
                  {match.note && (
                    <div style={{ border: '1px solid #E2E8F0', padding: 14 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Ghi chú từ Host</div>
                      <div style={{ fontSize: '0.88rem', color: '#0F172A', lineHeight: 1.5 }}>{match.note}</div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setTab('join')}>
                      {isFull ? 'ĐĂNG KÝ DỰ BỊ' : 'ỨNG TUYỂN / ĐĂNG KÝ NGAY'}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setTab('players')}>
                      XEM DANH SÁCH ({confirmed.length})
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: PLAYERS LIST */}
              {tab === 'players' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                    DANH SÁCH CHÍNH THỨC ({confirmed.length}/{match.max_slots})
                  </div>
                  {confirmed.length === 0 ? (
                    <div style={{ padding: '24px 0', color: '#64748B', textAlign: 'center', fontSize: '0.88rem' }}>
                      Chưa có người chơi nào đăng ký. Hãy là người đầu tiên!
                    </div>
                  ) : (
                    confirmed.map((p, idx) => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#475569', width: 20 }}>#{idx + 1}</span>
                          <div>
                            <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{p.player_name}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{p.player_phone || 'Chưa có SĐT'} · {p.skill_level}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            padding: '3px 8px', fontSize: '0.72rem', fontWeight: 700,
                            background: p.deposit_status === 'paid' ? '#F0FDF4' : '#FEF2F2',
                            color: p.deposit_status === 'paid' ? '#15803D' : '#B91C1C',
                            border: `1px solid ${p.deposit_status === 'paid' ? '#BBF7D0' : '#FECACA'}`
                          }}>
                            {p.deposit_status === 'paid' ? 'ĐÃ CỌC' : 'CHỜ CỌC'}
                          </span>
                          {isHost && (
                            <button onClick={() => handleCancel(p.id)} style={{ background: 'none', border: 'none', color: '#E11D48', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                              Hủy slot
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}

                  {waitlisted.length > 0 && (
                    <>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 14, marginBottom: 4 }}>
                        DANH SÁCH DỰ BỊ ({waitlisted.length})
                      </div>
                      {waitlisted.map((p, idx) => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px dashed #E2E8F0', background: '#F8FAFC' }}>
                          <div>
                            <strong style={{ fontSize: '0.88rem', color: '#334155' }}>Dự bị #{idx + 1}: {p.player_name}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{p.player_phone}</div>
                          </div>
                          {isHost && (
                            <button onClick={() => handleCancel(p.id)} style={{ background: 'none', border: 'none', color: '#E11D48', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                              Xóa
                            </button>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* TAB 3: JOIN FORM */}
              {tab === 'join' && (
                !user ? (
                  <div style={{ textAlign: 'center', padding: '36px 16px' }}>
                    <h3 style={{ color: '#0F172A', marginBottom: 8, fontSize: '1.1rem', fontWeight: 800 }}>YÊU CẦU ĐĂNG NHẬP</h3>
                    <p style={{ color: '#64748B', marginBottom: 20, fontSize: '0.88rem' }}>
                      Bạn cần đăng nhập tài khoản người chơi để đăng ký tham gia kèo.
                    </p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                      <button className="btn btn-primary" onClick={() => { onClose(); onShowAuth('login'); }}>
                        ĐĂNG NHẬP
                      </button>
                      <button className="btn btn-secondary" onClick={() => { onClose(); onShowAuth('register'); }}>
                        ĐĂNG KÝ
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: 12 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>Đăng ký với tư cách: {user.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{user.email} · Role: {user.role.toUpperCase()}</div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tên hiển thị</label>
                      <input className="form-input" required value={form.player_name} onChange={e => setForm({...form, player_name: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Số điện thoại / Zalo</label>
                      <input className="form-input" value={form.player_phone} onChange={e => setForm({...form, player_phone: e.target.value})} placeholder="0912 345 678" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Trình độ của bạn</label>
                      <select className="form-select" value={form.skill_level} onChange={e => setForm({...form, skill_level: e.target.value})}>
                        <option value="">-- Chọn trình độ --</option>
                        {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Ghi chú thêm</label>
                      <textarea className="form-textarea" rows={2} value={form.note} onChange={e => setForm({...form, note: e.target.value})} placeholder="Đến muộn 5p, xin đánh đôi nam nữ..." />
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }} disabled={joining}>
                      {joining ? 'ĐANG XỬ LÝ...' : (isFull ? 'ĐĂNG KÝ VÀO DỰ BỊ' : 'XÁC NHẬN ĐĂNG KÝ')}
                    </button>
                  </form>
                )
              )}

              {/* TAB 4: QR PAYMENT */}
              {tab === 'qr' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                  {/* Countdown Timer */}
                  <div style={{
                    width: '100%', padding: '12px 16px', background: '#FFFBEB', border: '1px solid #FDE68A',
                    borderRadius: 'var(--r-sm)', textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.78rem', color: '#B45309', fontWeight: 600, textTransform: 'uppercase' }}>
                      Thời gian giữ chỗ thanh toán
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#D97706', fontFamily: 'monospace' }}>
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#B45309', marginTop: 2 }}>
                      Vui lòng chuyển khoản và tải ảnh xác nhận trước khi hết giờ.
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div style={{ width: '100%', background: 'var(--bg-subtle)', padding: 14, border: '1px solid var(--border-color)', borderRadius: 'var(--r-sm)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: 8, textTransform: 'uppercase' }}>
                      THÔNG TIN CHUYỂN KHOẢN
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.85rem' }}>
                      <div><span style={{ color: 'var(--text-muted)' }}>Ngân hàng:</span> <strong>{match.bank_name || 'VietinBank'}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Số tài khoản:</span> <strong style={{ color: 'var(--brand)' }}>{match.bank_account || '108875886924'}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Chủ tài khoản:</span> <strong>{match.bank_owner || 'Nguyễn Huy Hoàng'}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Số tiền cọc:</span> <strong style={{ color: 'var(--danger)' }}>{fmtCurrency(match.cost_per_slot)}</strong></div>
                    </div>
                  </div>

                  {/* VietQR Code */}
                  {qrUrl && (
                    <div style={{ border: '1px solid var(--border-color)', padding: 10, background: '#FFFFFF', borderRadius: 'var(--r-sm)' }}>
                      <img src={qrUrl} alt="VietQR Code" style={{ width: 180, height: 180, display: 'block' }} />
                    </div>
                  )}

                  {/* Upload proof of payment */}
                  <div style={{ width: '100%', textAlign: 'left' }}>
                    <label className="form-label">XÁC NHẬN CHUYỂN KHOẢN (GỬI ẢNH ĐÃ THANH TOÁN)</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-input"
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setProofImage(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {proofImage && (
                      <div style={{ marginTop: 10, textAlign: 'center' }}>
                        <img src={proofImage} alt="Xác nhận cọc" style={{ maxHeight: 150, borderRadius: 6, border: '1px solid var(--border-color)' }} />
                      </div>
                    )}
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}
                      onClick={() => {
                        setMsg({ type: 'success', text: 'Đã gửi ảnh xác nhận cọc! Trạng thái giữ chỗ hiện tại là PENDING (Chờ Host xác nhận).' });
                        setTab('players');
                      }}
                    >
                      XÁC NHẬN ĐÃ THANH TOÁN (PENDING)
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: COPY ZALO */}
              {tab === 'copy' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <p style={{ fontSize: '0.84rem', color: '#64748B' }}>
                    Sao chép bài đăng định dạng chuẩn để dán trực tiếp vào nhóm Zalo/Facebook:
                  </p>
                  <button className="btn btn-primary" onClick={copyMatchText} style={{ justifyContent: 'center' }}>
                    {copyDone ? 'ĐÃ SAO CHÉP VÀO CLIPBOARD!' : 'SAO CHÉP NỘI DUNG BÀI ĐĂNG'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
