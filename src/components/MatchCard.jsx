// src/components/MatchCard.jsx - Clean Minimalist Card with 1 item per line
import { fmtCurrency, fmtDate, fmtTime, slotPercent } from '../utils/helpers';

export default function MatchCard({ match, onClick }) {
  const confirmed = parseInt(match.confirmed_count) || 0;
  const max = parseInt(match.max_slots) || 0;
  const isFull = confirmed >= max;
  const pct = slotPercent(confirmed, max);

  return (
    <div
      onClick={() => onClick(match)}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: '88px 1fr 180px',
        gap: 20,
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#E11D48';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#E2E8F0';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* 1. Left Badge Box */}
      <div style={{
        width: 88,
        height: 110,
        background: '#0F172A',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justify: 'center',
        textAlign: 'center',
        padding: 6,
      }}>
        <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.5px' }}>
          {match.district || match.city}
        </div>
        <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#E11D48', margin: '4px 0' }}>
          {match.start_time}
        </div>
        <div style={{ fontSize: '0.68rem', color: '#CBD5E1', fontWeight: 600 }}>
          {fmtDate(match.play_date).split('/')[0]}/{fmtDate(match.play_date).split('/')[1]}
        </div>
      </div>

      {/* 2. Middle Content: 1 item per line */}
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Title */}
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: 800,
          color: '#0F172A',
          marginBottom: 4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.2px',
        }}>
          {match.title}
        </h3>

        {/* Dòng 1: Tên Host */}
        <div style={{ fontSize: '0.84rem', color: '#475569' }}>
          Tên Host: <strong style={{ color: '#0F172A' }}>{match.host_name}</strong>
        </div>

        {/* Dòng 2: Tên sân */}
        <div style={{ fontSize: '0.84rem', color: '#475569' }}>
          Tên sân: <strong style={{ color: '#0F172A' }}>{match.court_name}</strong>
        </div>

        {/* Dòng 3: Địa chỉ / Khu vực */}
        <div style={{ fontSize: '0.84rem', color: '#475569' }}>
          Địa chỉ: <strong style={{ color: '#0F172A' }}>{match.district}, {match.city}</strong>
        </div>

        {/* Dòng 4: Thời gian */}
        <div style={{ fontSize: '0.84rem', color: '#475569' }}>
          Thời gian: <strong style={{ color: '#0F172A' }}>{fmtTime(match.start_time)} – {fmtTime(match.end_time)} ({fmtDate(match.play_date)})</strong>
        </div>

        {/* Dòng 5: Trình độ & Loại cầu */}
        <div style={{ fontSize: '0.84rem', color: '#475569', display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <span>Trình độ: <strong style={{ color: '#0F172A' }}>{match.skill_level}</strong></span>
          <span>·</span>
          <span>Cầu: <strong style={{ color: '#0F172A' }}>{match.shuttlecock || 'Ba Sao'}</strong></span>
          {match.waitlist_count > 0 && (
            <span style={{ padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(225,29,72,0.1)', color: '#E11D48', border: '1px solid rgba(225,29,72,0.2)' }}>
              Dự bị: {match.waitlist_count}
            </span>
          )}
        </div>

        {/* Dòng 6: Chi phí (Nổi bật) */}
        <div style={{ fontSize: '0.88rem', color: '#E11D48', fontWeight: 800, marginTop: 2 }}>
          Chi phí: {fmtCurrency(match.cost_per_slot)} / người
        </div>
      </div>

      {/* 3. Right Action & Progress */}
      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
        <button
          className="btn btn-primary"
          style={{
            width: '100%',
            justify: 'center',
            fontSize: '0.82rem',
            padding: '10px 12px',
            background: isFull ? '#475569' : '#E11D48',
            borderColor: isFull ? '#475569' : '#E11D48',
            color: '#FFFFFF',
            fontWeight: 700,
            letterSpacing: '0.5px',
          }}
        >
          {isFull ? 'ĐĂNG KÝ DỰ BỊ' : 'ỨNG TUYỂN NGAY'}
        </button>

        {/* Slot Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: 4 }}>
            <span>ĐÃ ĐĂNG KÝ</span>
            <span style={{ color: isFull ? '#E11D48' : '#059669' }}>
              {confirmed}/{max} suất
            </span>
          </div>
          <div style={{ height: 6, background: '#E2E8F0', width: '100%' }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: isFull ? '#E11D48' : '#059669',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
