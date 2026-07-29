// src/components/Navbar.jsx - Careerviet-Style Clean Top Header
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';

export default function Navbar({ onCreateMatch, onShowAuth }) {
  const { user, loading } = useAuth();

  return (
    <header style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', sticky: 'top', zIndex: 100 }}>
      {/* Top micro bar */}
      <div style={{ background: '#0F172A', color: '#94A3B8', fontSize: '0.75rem', padding: '6px 0', borderBottom: '1px solid #1E293B' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>Mạng Lưới Giao Lưu Cầu Lông Hàng Đầu Việt Nam</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <span>Hotline: 1900 8888</span>
            <span>Hướng dẫn tạo kèo</span>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>

        {/* Brand & Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <a href="#" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: '#E11D48', color: '#FFFFFF', fontWeight: 900, fontSize: '1.1rem', padding: '6px 10px', letterSpacing: '-0.5px' }}>
              PRO
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-main)', letterSpacing: '-0.5px', lineHeight: 1 }}>
                KEO CAU PRO
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Badminton Hub
              </div>
            </div>
          </a>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', gap: 20 }} className="hide-mobile">
            <a href="#" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', textDecoration: 'none', padding: '6px 0' }}>
              Tìm Kèo Chơi
            </a>
            <a href="#" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'none', padding: '6px 0' }}>
              Danh Sách Sân
            </a>
            <a href="#" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'none', padding: '6px 0' }}>
              Bảng Xếp Hạng
            </a>
            <a href="#" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'none', padding: '6px 0' }}>
              Cẩm Nang
            </a>
          </nav>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {loading ? (
            <div style={{ width: 80, height: 36, background: 'var(--bg-subtle)' }} className="skeleton" />
          ) : user ? (
            <>
              {user.role === 'host' && (
                <button
                  id="btn-create-match"
                  className="btn btn-primary"
                  onClick={onCreateMatch}
                >
                  DÀNH CHO HOST - TẠO KÈO
                </button>
              )}
              <UserMenu />
            </>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                id="btn-login"
                className="btn btn-secondary"
                onClick={() => onShowAuth('login')}
              >
                Đăng Nhập
              </button>
              <button
                id="btn-register"
                className="btn btn-primary"
                onClick={() => onShowAuth('register')}
              >
                Đăng Ký
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
