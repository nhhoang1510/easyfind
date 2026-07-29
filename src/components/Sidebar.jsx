// src/components/Sidebar.jsx - Minimalist Right Sidebar Column
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ onCreateMatch, openCount, onShowAuth }) {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Banner 1: Host CTA / Quick Action */}
      <div style={{
        background: '#0F172A',
        color: '#FFFFFF',
        border: '1px solid #1E293B',
        padding: 24,
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E11D48', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
          Dành Cho Người Tổ Chức (Host)
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 10, lineHeight: 1.3 }}>
          TẠO KÈO VÀ QUẢN LÝ DỰ BỊ TỰ ĐỘNG
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: 18, lineHeight: 1.6 }}>
          Tự động đếm slot, phòng chống bùng kèo với mã QR cọc tiền. Không tốn thời gian lọc comment Facebook.
        </p>
        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => {
            if (!user) { onShowAuth('login'); return; }
            if (user.role !== 'host') {
              alert('Bạn cần đăng ký tài khoản Host để tạo kèo.');
              return;
            }
            onCreateMatch();
          }}
        >
          TẠO KÈO NGAY
        </button>
      </div>

      {/* Banner 2: Real-time Stats */}
      <div className="panel-card">
        <h4 style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--border-color)' }}>
          THỐNG KÊ TỔNG QUAN
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Kèo đang mở:</span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{openCount}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tỷ lệ lấp đầy:</span>
            <strong style={{ fontSize: '1rem', color: 'var(--accent-mint)' }}>88.5%</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Chống bùng cọc:</span>
            <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>100% VietQR</strong>
          </div>
        </div>
      </div>

      {/* Banner 3: Quick Guidelines */}
      <div className="panel-card">
        <h4 style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--border-color)' }}>
          QUY TRÌNH THAM GIA
        </h4>
        <ol style={{ paddingLeft: 16, fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 10, lineHeight: 1.5 }}>
          <li><strong>Chọn kèo phù hợp:</strong> Lọc theo quận, giờ và trình độ.</li>
          <li><strong>Đăng ký 1-click:</strong> Điền tên và SĐT (tự động nếu đã đăng nhập).</li>
          <li><strong>Cọc tiền VietQR:</strong> Quét QR chuyển khoản để đảm bảo suất chính thức.</li>
          <li><strong>Tự động đôn dự bị:</strong> Nếu ai hủy slot, người dự bị đầu tiên sẽ được đôn lên ngay.</li>
        </ol>
      </div>
    </div>
  );
}
