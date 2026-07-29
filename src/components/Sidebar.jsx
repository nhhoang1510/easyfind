// src/components/Sidebar.jsx - Clean minimal sidebar
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ openCount }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  function handleCreateClick() {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'host') {
      alert('Bạn cần đăng ký tài khoản Host để tạo kèo.');
      return;
    }
    navigate('/create-match');
  }

  return (
    <div className="sidebar">
      {/* Host CTA */}
      <div className="sidebar-card sidebar-card--dark">
        <span className="sidebar-label">Dành cho Host</span>
        <h3 className="sidebar-title">Tạo kèo và quản lý slot tự động</h3>
        <p className="sidebar-desc">
          Đếm slot, chống bùng cọc với VietQR. Không cần lọc comment Facebook nữa.
        </p>
        <button
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={handleCreateClick}
        >
          Tạo kèo ngay
        </button>
      </div>

      {/* Stats */}
      <div className="sidebar-card">
        <h4 className="sidebar-section-title">Thống kê</h4>
        <div className="sidebar-stat">
          <span>Kèo đang mở</span>
          <strong>{openCount}</strong>
        </div>
        <div className="sidebar-stat">
          <span>Tỷ lệ lấp đầy</span>
          <strong>88.5%</strong>
        </div>
      </div>

      {/* Steps */}
      <div className="sidebar-card">
        <h4 className="sidebar-section-title">Cách tham gia</h4>
        <ol className="sidebar-steps">
          <li>Chọn kèo phù hợp theo quận, giờ, trình độ</li>
          <li>Đăng ký 1-click (tự động nếu đã đăng nhập)</li>
          <li>Cọc tiền qua VietQR để giữ suất</li>
          <li>Dự bị tự đôn lên khi có người huỷ</li>
        </ol>
      </div>
    </div>
  );
}
