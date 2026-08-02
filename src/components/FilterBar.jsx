// src/components/FilterBar.jsx - Clean Search Bar with Manual Trigger
import { useState, useEffect } from 'react';
import { HN_DISTRICTS, SKILL_LEVELS } from '../utils/helpers';

const GENDER_OPTIONS = [
  { value: 'mixed',  label: 'Nam & Nữ' },
  { value: 'male',   label: 'Chỉ Nam' },
  { value: 'female', label: 'Chỉ Nữ' },
];

export default function FilterBar({ filters, onChange }) {
  const [localFilters, setLocalFilters] = useState({
    district: filters.district || '',
    gender_required: filters.gender_required || '',
    skill_level: filters.skill_level || '',
  });

  useEffect(() => {
    setLocalFilters({
      district: filters.district || '',
      gender_required: filters.gender_required || '',
      skill_level: filters.skill_level || '',
    });
  }, [filters]);

  function setField(key, value) {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  }

  function handleSearch(e) {
    if (e) e.preventDefault();
    onChange(localFilters);
  }

  function handleReset() {
    const empty = { district: '', gender_required: '', skill_level: '' };
    setLocalFilters(empty);
    onChange(empty);
  }

  const hasActiveFilters = Boolean(localFilters.district || localFilters.gender_required || localFilters.skill_level);

  return (
    <div className="filter-bar-wrapper">
      <div className="container">
        <form className="filter-bar-card" onSubmit={handleSearch}>
          
          {/* 1. Khu vực */}
          <div className={`filter-field ${localFilters.district ? 'filter-field--active' : ''}`}>
            <svg className="filter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <select
              id="filter-district"
              className="filter-select-input"
              value={localFilters.district}
              onChange={e => setField('district', e.target.value)}
            >
              <option value="">Tất cả khu vực</option>
              {HN_DISTRICTS.map(d => (
                <option key={d} value={d}>Quận {d}</option>
              ))}
            </select>
            <svg className="filter-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>

          <div className="filter-divider" />

          {/* 2. Giới tính */}
          <div className={`filter-field ${localFilters.gender_required ? 'filter-field--active' : ''}`}>
            <svg className="filter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="8" r="4"/>
            </svg>
            <select
              id="filter-gender"
              className="filter-select-input"
              value={localFilters.gender_required}
              onChange={e => setField('gender_required', e.target.value)}
            >
              <option value="">Tất cả giới tính</option>
              {GENDER_OPTIONS.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
            <svg className="filter-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>

          <div className="filter-divider" />

          {/* 3. Trình độ */}
          <div className={`filter-field ${localFilters.skill_level ? 'filter-field--active' : ''}`}>
            <svg className="filter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <select
              id="filter-skill"
              className="filter-select-input"
              value={localFilters.skill_level}
              onChange={e => setField('skill_level', e.target.value)}
            >
              <option value="">Tất cả trình độ</option>
              {SKILL_LEVELS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <svg className="filter-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>

          {/* Clear button if active */}
          {hasActiveFilters && (
            <button
              type="button"
              className="filter-reset-btn"
              onClick={handleReset}
              title="Xoá bộ lọc"
            >
              Xoá
            </button>
          )}

          {/* 4. Nút Tìm Kiếm (Search Button) */}
          <button
            type="submit"
            id="btn-search-submit"
            className="filter-search-submit-btn"
            title="Bấm để áp dụng tìm kiếm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span>Tìm kiếm</span>
          </button>

        </form>
      </div>
    </div>
  );
}
