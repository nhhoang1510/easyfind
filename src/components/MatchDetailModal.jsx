// src/components/MatchDetailModal.jsx - Clean Minimalist Flat Editorial Modal
import { useState, useEffect } from 'react';
import {
  fmtCurrency, fmtDate, fmtTime,
  avatarColor, avatarInitials, fmtPhone, slotPercent,
  vietQRUrl, BANKS, SKILL_LEVELS,
} from '../utils/helpers';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AIForensicReport from './AIForensicReport';

export default function MatchDetailModal({ match: initMatch, initialTab = 'players', onClose, onUpdate, onShowAuth }) {
  const { user } = useAuth();
  const isHost = user && (user.role === 'host') && (user.id === initMatch.host_id || user.full_name === initMatch.host_name);

  const [match, setMatch] = useState(initMatch);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [tab, setTab] = useState(initialTab === 'info' ? 'players' : initialTab); // players | join | qr | copy
  const [form, setForm] = useState({
    player_name: user?.full_name || '',
    player_phone: user?.phone || '',
    skill_level: user?.skill_level || '',
    note: '',
  });
  const [msg, setMsg] = useState(null);
  const [copyDone, setCopyDone] = useState(false);
  const [proofImage, setProofImage] = useState(null);
  const [aiReport, setAiReport] = useState(null);
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
        setMsg({ type: 'success', text: `Đã vào danh sách dự bị! Bạn sẽ được thông báo khi có chỗ trống.` });
      } else {
        setMsg({ type: 'success', text: `Đăng ký tham gia thành công! Vui lòng có mặt đúng giờ.` });
      }
      setTab('players');
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
    const playerList = participants.map((p, i) => `   ${i + 1}. ${p.player_name}`).join('\n');
    const categoriesText = match.slot_categories && match.slot_categories.length > 0
      ? match.slot_categories.map(c => `   - ${c.gender === 'female' ? '♀ Nữ' : '♂ Nam'} (${c.skill_level}): ${c.slots} suất – ${fmtCurrency(c.cost)}`).join('\n')
      : `   - Chi phí: ${fmtCurrency(match.cost_per_slot)} / người`;

    const text = [
      `🎾 KÈO CẦU LÔNG: ${match.court_name ? match.court_name.toUpperCase() : ''}`,
      ``,
      `📍 Sân: ${match.court_name || ''} (${match.district || ''})`,
      `📅 Ngày: ${fmtDate(match.play_date)}`,
      `⏰ Thời gian: ${fmtTime(match.start_time)} – ${fmtTime(match.end_time)}`,
      `👥 Slot: ${participants.length}/${match.max_slots} suất`,
      `💰 Phân bổ suất & Chi phí:`,
      categoriesText,
      `🏸 Loại cầu: ${match.shuttlecock || 'Ba Sao'}`,
      ``,
      `Danh sách tham gia:`,
      playerList || '   (Chưa có ai đăng ký)',
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
              📍 {match.court_name} – {match.district}
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>
              Chi tiết danh sách & Đăng ký
            </h2>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ fontSize: '1.2rem', padding: '4px 10px' }}>
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          {[
            { id: 'players', label: `DANH SÁCH THAM GIA (${confirmed.length}/${match.max_slots})` },
            { id: 'copy', label: 'COPY BÀI ZALO' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                padding: '12px 8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: 'none',
                borderBottom: tab === t.id ? '2px solid var(--brand)' : '2px solid transparent',
                background: tab === t.id ? '#FFFFFF' : 'transparent',
                color: tab === t.id ? 'var(--brand)' : '#64748B',
                cursor: 'pointer',
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, background: '#F8FAFC', padding: 18, border: '1px solid #E2E8F0', borderRadius: 8 }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Host tổ chức</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginTop: 3 }}>{match.host_name}</div>
                      {match.host_phone && <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: 1 }}>SĐT: {fmtPhone(match.host_phone)}</div>}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Tên sân</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginTop: 3 }}>{match.court_name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Ngày & Thời gian</div>
                      <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0F172A', marginTop: 3 }}>
                        {fmtDate(match.play_date)} ({fmtTime(match.start_time)} – {fmtTime(match.end_time)})
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Chi phí & Phân bổ suất</div>
                      {match.slot_categories && match.slot_categories.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                          {match.slot_categories.map((c, i) => (
                            <div key={i} style={{ fontSize: '0.85rem', fontWeight: 700, color: c.gender === 'female' ? '#E11D48' : '#2563EB' }}>
                              {c.gender === 'female' ? '♀' : '♂'} {c.slots} suất {c.gender === 'female' ? 'Nữ' : 'Nam'} ({c.skill_level}) – {fmtCurrency(c.cost)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#E11D48', marginTop: 3 }}>
                          {fmtCurrency(match.cost_per_slot)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Trình độ yêu cầu</div>
                      <div style={{ fontSize: '1.02rem', fontWeight: 600, color: '#0F172A', marginTop: 3 }}>{match.skill_level}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Loại cầu sử dụng</div>
                      <div style={{ fontSize: '1.02rem', fontWeight: 600, color: '#0F172A', marginTop: 3 }}>{match.shuttlecock || 'Ba Sao'}</div>
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
                            background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0'
                          }}>
                            XÁC NHẬN
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
                      <input className="form-input" required value={form.player_name} onChange={e => setForm({ ...form, player_name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Số điện thoại / Zalo</label>
                      <input className="form-input" value={form.player_phone} onChange={e => setForm({ ...form, player_phone: e.target.value })} placeholder="0912 345 678" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Trình độ của bạn</label>
                      <select className="form-select" value={form.skill_level} onChange={e => setForm({ ...form, skill_level: e.target.value })}>
                        <option value="">-- Chọn trình độ --</option>
                        {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Ghi chú thêm</label>
                      <textarea className="form-textarea" rows={2} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Đến muộn 5p, xin đánh đôi nam nữ..." />
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }} disabled={joining}>
                      {joining ? 'ĐANG XỬ LÝ...' : (isFull ? 'ĐĂNG KÝ VÀO DỰ BỊ' : 'XÁC NHẬN ĐĂNG KÝ')}
                    </button>
                  </form>
                )
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
