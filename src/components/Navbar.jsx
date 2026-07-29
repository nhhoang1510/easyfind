// src/components/Navbar.jsx - Clean minimal top bar
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';

export default function Navbar({ onCreateMatch, onShowAuth }) {
  const { user, loading } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        {/* Logo */}
        <a href="#" className="topbar-logo" id="logo-home">
          <span className="topbar-logo-name">EasyFind</span>
        </a>

        {/* Right side */}
        <div className="topbar-right">
          {loading ? (
            <div className="skeleton" style={{ width: 80, height: 32 }} />
          ) : user ? (
            <div className="topbar-user-area">
              {user.role === 'host' && (
                <button
                  id="btn-create-match"
                  className="btn btn-primary btn-sm"
                  onClick={onCreateMatch}
                >
                  + Tạo kèo
                </button>
              )}
              <UserMenu />
            </div>
          ) : (
            <div className="topbar-auth">
              <button
                id="btn-login"
                className="btn-text"
                onClick={() => onShowAuth('login')}
              >
                Đăng nhập
              </button>
              <button
                id="btn-register"
                className="btn btn-primary btn-sm"
                onClick={() => onShowAuth('register')}
              >
                Đăng ký
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
