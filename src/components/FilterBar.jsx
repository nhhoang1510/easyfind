// src/components/FilterBar.jsx - Minimal Rectangular Search & Filter Bar
import { CITIES, HN_DISTRICTS, HCM_DISTRICTS, DN_DISTRICTS, SKILL_LEVELS } from '../utils/helpers';

const districtMap = { 'Hà Nội': HN_DISTRICTS, 'TP.HCM': HCM_DISTRICTS, 'Đà Nẵng': DN_DISTRICTS };

export default function FilterBar({ filters, onChange, totalCount }) {
  const districts = districtMap[filters.city] || [];

  function set(key, value) {
    onChange({
      ...filters,
      [key]: value,
      ...(key === 'city' ? { district: '' } : {})
    });
  }

  function reset() {
    onChange({ city: '', district: '', skill_level: '', has_slot: false });
  }

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: 20, marginBottom: 24 }}>
      {/* Row 1: Search Inputs + Search Button */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 12, alignItems: 'center', marginBottom: 14 }}>
        
        {/* City Input */}
        <div>
          <select
            id="filter-city"
            className="form-select"
            value={filters.city}
            onChange={e => set('city', e.target.value)}
          >
            <option value="">Tất cả Thành phố</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* District Input */}
        <div>
          <select
            id="filter-district"
            className="form-select"
            value={filters.district}
            onChange={e => set('district', e.target.value)}
            disabled={!filters.city}
          >
            <option value="">Tất cả Quận / Huyện</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Skill Level Input */}
        <div>
          <select
            id="filter-skill"
            className="form-select"
            value={filters.skill_level}
            onChange={e => set('skill_level', e.target.value)}
          >
            <option value="">Trình độ yêu cầu</option>
            {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Action Button */}
        <div>
          <button className="btn btn-primary" style={{ width: '100%', minWidth: 120 }}>
            TÌM KÈO
          </button>
        </div>
      </div>

      {/* Row 2: Secondary Filters & Clear Option */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Quick slot filter button */}
          <button
            type="button"
            onClick={() => set('has_slot', !filters.has_slot)}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: filters.has_slot ? 'var(--text-main)' : 'var(--bg-subtle)',
              color: filters.has_slot ? 'var(--bg-surface)' : 'var(--text-muted)',
              border: '1px solid var(--border-color)',
            }}
          >
            Chỉ xem kèo còn chỗ trống
          </button>
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={reset}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Xóa bộ lọc ({activeCount})
          </button>
        )}
      </div>
    </div>
  );
}
