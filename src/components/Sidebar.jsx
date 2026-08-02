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
    navigate('/create-match');
  }

  return (
    <div className="sidebar">
      {/* Create match CTA */}
      <div className="sidebar-card sidebar-card--dark">
        <span className="sidebar-label">Tự tạo kèo</span>
        <h3 className="sidebar-title">Tạo kèo & Quản lý danh sách tự động</h3>
        <p className="sidebar-desc">
          Tự động cập nhật danh sách người tham gia real-time. Không lo trôi comment Zalo/Facebook nữa.
        </p>
        <button
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={handleCreateClick}
        >
          + Tạo kèo mới
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
          <li>Xác nhận tham gia không cần đặt cọc</li>
          <li>Dự bị tự đôn lên khi có người huỷ</li>
        </ol>
      </div>
    </div>
  );
}
