// src/components/MatchCard.jsx - CareerViet-style listing card
import { fmtCurrency, fmtDate, fmtTime, slotPercent } from '../utils/helpers';

const GENDER_LABEL = {
  male:   'Chỉ Nam',
  female: 'Chỉ Nữ',
  mixed:  'Nam & Nữ',
};

const SKILL_COLOR = {
  'Mới chơi':      { bg: '#EFF6FF', text: '#3B82F6' },
  'Yếu':           { bg: '#F0FDF4', text: '#22C55E' },
  'Trung bình yếu':{ bg: '#F0FDF4', text: '#16A34A' },
  'Trung bình':    { bg: '#FFFBEB', text: '#D97706' },
  'Trung bình khá':{ bg: '#FFF7ED', text: '#EA580C' },
  'Khá':           { bg: '#FFF1F2', text: '#E11D48' },
};

export default function MatchCard({ match, onClick, onRegisterClick }) {
  const confirmed = parseInt(match.confirmed_count) || 0;
  const max       = parseInt(match.max_slots) || 0;
  const isFull    = confirmed >= max;
  const pct       = slotPercent(confirmed, max);
  const skillStyle = SKILL_COLOR[match.skill_level] || { bg: '#F1F5F9', text: '#64748B' };

  const dateStr = fmtDate(match.play_date); // dd/mm/yyyy
  const [dd, mm] = dateStr.split('/');

  return (
    <div className="mc" onClick={() => onClick(match)}>

      {/* ── LEFT: Date badge ── */}
      <div className="mc-badge">
        <span className="mc-badge-time">{fmtTime(match.start_time)}</span>
        <span className="mc-badge-date">{dd}/{mm}</span>
      </div>

      {/* ── MIDDLE: Details ── */}
      <div className="mc-body">
        {/* Court Name as Main Header */}
        <h3 className="mc-title" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
          📍 {match.court_name} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.85rem' }}>– {match.district}</span>
        </h3>

        {/* Host */}
        <div className="mc-row" style={{ marginBottom: 6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-light)', flexShrink: 0 }}>
            <path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="8" r="4"/>
          </svg>
          <span className="mc-host" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Host: {match.host_name}</span>
        </div>

        {/* Cost / Category breakdown */}
        {match.slot_categories && match.slot_categories.length > 0 ? (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '6px 0 8px 0' }}>
            {match.slot_categories.map((cat, i) => (
              <span key={i} style={{
                fontSize: '0.8rem', fontWeight: 700, padding: '4px 10px', borderRadius: 6,
                background: cat.gender === 'female' ? '#FFF1F2' : '#EFF6FF',
                color: cat.gender === 'female' ? '#E11D48' : '#1D4ED8',
                border: `1px solid ${cat.gender === 'female' ? '#FECDD3' : '#BFDBFE'}`,
                display: 'inline-flex', alignItems: 'center', gap: 5
              }}>
                {cat.gender === 'female' ? '♀' : '♂'} {cat.slots} {cat.gender === 'female' ? 'Nữ' : 'Nam'} ({cat.skill_level}) – {fmtCurrency(cat.cost)}
              </span>
            ))}
          </div>
        ) : (
          <div className="mc-row mc-row--cost" style={{ marginBottom: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{fmtCurrency(match.cost_per_slot)} / người</span>
          </div>
        )}

        {/* Time */}
        <div className="mc-row">
          <span className="mc-info-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-light)' }}>
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {fmtTime(match.start_time)} – {fmtTime(match.end_time)}
          </span>
        </div>

        {/* Tags row */}
        <div className="mc-tags">
          <span className="mc-tag" style={{ background: skillStyle.bg, color: skillStyle.text, border: `1px solid ${skillStyle.text}22` }}>
            {match.skill_level}
          </span>
          {match.gender_required && (
            <span className="mc-tag">
              {GENDER_LABEL[match.gender_required] || match.gender_required}
            </span>
          )}
          <span className="mc-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <ellipse cx="12" cy="7" rx="5" ry="2" />
              <line x1="7" y1="7" x2="12" y2="19" />
              <line x1="17" y1="7" x2="12" y2="19" />
              <circle cx="12" cy="19" r="1.5" fill="currentColor" />
            </svg>
            {match.shuttlecock || 'Ba Sao'}
          </span>
        </div>

        {/* Note of host */}
        {match.note && (
          <div style={{
            fontSize: '0.78rem', color: '#D97706', background: '#FEF3C7',
            padding: '4px 8px', borderRadius: 6, marginTop: 6, border: '1px solid #FDE68A',
            display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 500
          }}>
            💬 <i>"{match.note}"</i>
          </div>
        )}
      </div>

      {/* ── RIGHT: Slot status + CTA + Maps ── */}
      <div className="mc-action" onClick={e => e.stopPropagation()}>
        {/* Slot progress */}
        <div className="mc-slots">
          <span className="mc-slots-label">
            <span style={{ fontWeight: 700, color: isFull ? 'var(--accent-primary)' : 'var(--accent-mint)' }}>{confirmed}</span>/{max} suất
          </span>
          <div className="mc-slots-bar">
            <div
              className="mc-slots-fill"
              style={{ width: `${pct}%`, background: isFull ? 'var(--accent-primary)' : 'var(--accent-mint)' }}
            />
          </div>
        </div>

        {/* CTA button */}
        <button
          className={`mc-cta ${isFull ? 'mc-cta--full' : ''}`}
          onClick={() => (onRegisterClick ? onRegisterClick(match) : onClick(match))}
        >
          {isFull ? 'Đăng ký dự bị' : 'Đăng ký ngay'}
        </button>

        {/* Google Maps link button (Full width on mobile below CTA) */}
        <a
          href={match.maps_url || `https://maps.google.com/?q=${encodeURIComponent(match.court_name + ' ' + match.district + ' Hà Nội')}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            fontSize: '0.82rem', fontWeight: 600, color: 'var(--brand)',
            background: 'var(--brand-light)', padding: '9px 12px', borderRadius: 6,
            textDecoration: 'none', border: '1px solid var(--brand-border)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            width: '100%', boxSizing: 'border-box', whiteSpace: 'nowrap'
          }}
        >
          <span>📍 Xem bản đồ sân</span> ↗
        </a>
      </div>

    </div>
  );
}
