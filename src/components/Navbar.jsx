// src/components/Navbar.jsx - Clean minimal top bar with Router Links
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';

export default function Navbar() {
  const { user, loading } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        {/* Logo */}
        <Link to="/" className="topbar-logo" id="logo-home">
          <span className="topbar-logo-name">EasyFind</span>
        </Link>

        {/* Right side */}
        <div className="topbar-right">
          {loading ? (
            <div className="skeleton" style={{ width: 80, height: 32 }} />
          ) : user ? (
            <div className="topbar-user-area">
              {user.role === 'host' && (
                <Link
                  to="/create-match"
                  id="btn-create-match"
                  className="btn btn-primary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  + Tạo kèo
                </Link>
              )}
              <UserMenu />
            </div>
          ) : (
            <div className="topbar-auth">
              <Link
                to="/login"
                id="btn-login"
                className="btn-text"
                style={{ textDecoration: 'none' }}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                id="btn-register"
                className="btn btn-primary btn-sm"
                style={{ textDecoration: 'none' }}
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
