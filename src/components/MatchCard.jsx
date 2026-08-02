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
        {/* Title */}
        <h3 className="mc-title">{match.title || match.court_name}</h3>

        {/* Host */}
        <div className="mc-row">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-light)', flexShrink: 0 }}>
            <path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="8" r="4"/>
          </svg>
          <span className="mc-host">{match.host_name}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, background: 'rgba(5,150,105,0.1)', color: '#059669', fontSize: '0.72rem', fontWeight: 600, padding: '1px 6px', borderRadius: 100, marginLeft: 4 }}>
            ✓ Đã xác minh
          </span>
        </div>

        {/* Cost */}
        <div className="mc-row mc-row--cost">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <span>{fmtCurrency(match.cost_per_slot)} / người</span>
        </div>

        {/* Location */}
        <div className="mc-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="mc-info-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--brand)' }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {match.court_name} – {match.district}
          </span>
          <a
            href={match.maps_url || `https://maps.google.com/?q=${encodeURIComponent(match.court_name + ' ' + match.district + ' Hà Nội')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand)',
              background: 'var(--brand-light)', padding: '2px 8px', borderRadius: 4,
              textDecoration: 'none', border: '1px solid var(--brand-border)',
              display: 'inline-flex', alignItems: 'center', gap: 3
            }}
          >
            Bản đồ ↗
          </a>
        </div>

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
      </div>

      {/* ── RIGHT: Slot status + CTA ── */}
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
      </div>

    </div>
  );
}
