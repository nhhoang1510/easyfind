// src/components/AIForensicReport.jsx - Chuyên nghiệp Forensic AI Assessment Panel
import React from 'react';

export default function AIForensicReport({ report }) {
  if (!report) return null;

  const { is_authentic, manipulation_risk = 15, ai_generation_likelihood = 20, signals = [], message } = report;

  return (
    <div style={{
      marginTop: 16,
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 12,
      padding: 18,
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Banner trạng thái chính */}
      <div style={{
        padding: '14px 16px',
        borderRadius: 8,
        background: is_authentic ? '#F0FDF4' : '#FEF2F2',
        border: `1px solid ${is_authentic ? '#BBF7D0' : '#FECACA'}`,
        color: is_authentic ? '#15803D' : '#B91C1C',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 16,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: is_authentic ? '#22C55E' : '#EF4444',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, flexShrink: 0, fontSize: '0.9rem'
        }}>
          {is_authentic ? '✓' : '✕'}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
            {is_authentic ? 'Xác Minh Hợp Lệ (Authentic Image)' : 'Phát Hiện Bất Thường (Manipulation Detected)'}
          </div>
          <div style={{ fontSize: '0.82rem', marginTop: 2, opacity: 0.9, lineHeight: 1.4 }}>
            {message || (is_authentic ? 'Ảnh minh chứng có cấu trúc đồng nhất, không phát hiện dấu hiệu can thiệp.' : 'Phát hiện rủi ro chỉnh sửa ELA hoặc cắt ghép chữ/số trên ảnh.')}
          </div>
        </div>
      </div>

      {/* 2 Thanh Progress Bar Chỉ Số Rủi Ro (Risk Metrics) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
        {/* Metric 1: Manipulation Risk */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>
            <span style={{ color: 'var(--text-sub)' }}>Manipulation Risk</span>
            <span style={{ color: manipulation_risk > 50 ? '#DC2626' : '#059669' }}>{manipulation_risk}%</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-subtle)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${manipulation_risk}%`,
              background: manipulation_risk > 50 ? '#DC2626' : '#059669',
              borderRadius: 4,
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Metric 2: AI Generation Likelihood */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>
            <span style={{ color: 'var(--text-sub)' }}>AI Generation Likelihood</span>
            <span style={{ color: ai_generation_likelihood > 50 ? '#D97706' : '#059669' }}>{ai_generation_likelihood}%</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-subtle)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${ai_generation_likelihood}%`,
              background: ai_generation_likelihood > 50 ? '#D97706' : '#059669',
              borderRadius: 4,
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Danh sách thẻ tín hiệu chi tiết (Technical Signals) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {signals.map((sig, idx) => {
          const isDanger = sig.type === 'danger';
          const isWarning = sig.type === 'warning';
          const bgColor = isDanger ? '#FEF2F2' : isWarning ? '#FFFBEB' : '#F0FDF4';
          const borderColor = isDanger ? '#FECACA' : isWarning ? '#FDE68A' : '#BBF7D0';
          const textColor = isDanger ? '#991B1B' : isWarning ? '#92400E' : '#166534';
          const icon = isDanger ? '⚠️' : isWarning ? '⚡' : '✓';

          return (
            <div key={idx} style={{
              padding: '10px 12px',
              borderRadius: 6,
              background: bgColor,
              border: `1px solid ${borderColor}`,
              color: textColor,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              lineHeight: 1.4
            }}>
              <span style={{ fontWeight: 700 }}>{icon}</span>
              <div>
                <strong style={{ display: 'inline-block', marginRight: 6 }}>{sig.title}:</strong>
                <span>{sig.detail}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
