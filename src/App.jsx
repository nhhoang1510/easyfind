// src/App.jsx - Minimalist Clean Layout without Header & Footer
import { useState, useEffect, useCallback } from 'react';
import './index.css';
import { api } from './api/client';
import { AuthProvider, useAuth } from './context/AuthContext';
import FilterBar from './components/FilterBar';
import MatchCard from './components/MatchCard';
import Sidebar from './components/Sidebar';
import UserMenu from './components/UserMenu';
import MatchDetailModal from './components/MatchDetailModal';
import CreateMatchModal from './components/CreateMatchModal';
import AuthModal from './components/AuthModal';

function AppInner() {
  const { user, loading: authLoading } = useAuth();

  const [matches,        setMatches]        = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [error,          setError]          = useState(null);
  const [filters,        setFilters]        = useState({ city: '', district: '', skill_level: '', has_slot: false });
  const [selectedMatch,  setSelectedMatch]  = useState(null);
  const [showCreate,     setShowCreate]     = useState(false);
  const [showAuth,       setShowAuth]       = useState(null);
  const [sortBy,         setSortBy]         = useState('time');

  const loadMatches = useCallback(async () => {
    setMatchesLoading(true); setError(null);
    try {
      const params = {};
      if (filters.city)        params.city        = filters.city;
      if (filters.district)    params.district    = filters.district;
      if (filters.skill_level) params.skill_level = filters.skill_level;
      if (filters.has_slot)    params.has_slot    = 'true';
      const data = await api.getMatches(params);
      setMatches(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setMatchesLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadMatches(); }, [loadMatches]);

  function handleMatchCreated(newMatch) {
    setMatches(prev => [{ ...newMatch, confirmed_count: 0, waitlist_count: 0 }, ...prev]);
  }

  function handleShowAuth(tab) {
    setShowAuth(tab);
  }

  function handleCreateMatch() {
    if (!user) { setShowAuth('login'); return; }
    if (user.role !== 'host') {
      alert('Chỉ tài khoản Host mới có thể tạo kèo. Đăng ký tài khoản Host để tiếp tục!');
      return;
    }
    setShowCreate(true);
  }

  const openMatches = matches.filter(m => m.status !== 'cancelled');

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>ĐANG TẢI KÈO CẦU PRO...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
        
        {/* Top Minimal Action Row (Inline Brand & Auth Controls without full Header) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#E11D48', color: '#FFFFFF', fontWeight: 900, fontSize: '1rem', padding: '4px 8px' }}>
              PRO
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
              KEO CAU PRO
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user ? (
              <>
                {user.role === 'host' && (
                  <button className="btn btn-primary btn-sm" onClick={handleCreateMatch}>
                    TẠO KÈO
                  </button>
                )}
                <UserMenu />
              </>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handleShowAuth('login')}>
                  Đăng Nhập
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => handleShowAuth('register')}>
                  Đăng Ký
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Top Search & Filter Bar */}
        <FilterBar
          filters={filters}
          onChange={setFilters}
          totalCount={openMatches.length}
        />

        {/* Main 2-Column Grid */}
        <div className="main-layout">
          
          {/* LEFT COLUMN: Item Count + Sorting + List of Items */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                {openMatches.length} Kèo Cầu Lông Đang Mở
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span>Sắp xếp theo:</span>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '4px 10px', fontSize: '0.82rem' }}
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="time">Giờ chơi gần nhất</option>
                  <option value="created">Kèo mới tạo</option>
                </select>
              </div>
            </div>

            {/* List of Match Cards */}
            {matchesLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ height: 110, background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }} className="skeleton" />
                ))}
              </div>
            ) : error ? (
              <div className="panel-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <h3 style={{ marginBottom: 8 }}>Không thể kết nối server API</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>{error}</p>
                <button className="btn btn-primary" onClick={loadMatches}>Thử lại</button>
              </div>
            ) : openMatches.length === 0 ? (
              <div className="panel-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <h3 style={{ marginBottom: 8 }}>Không tìm thấy kèo nào</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Thử thay đổi bộ lọc hoặc tạo kèo mới!</p>
                {user?.role === 'host' && (
                  <button className="btn btn-primary" onClick={handleCreateMatch}>TẠO KÈO MỚI</button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {openMatches.map(m => (
                  <MatchCard key={m.id} match={m} onClick={setSelectedMatch} />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar Banners */}
          <div className="sidebar-column">
            <Sidebar
              onCreateMatch={handleCreateMatch}
              openCount={openMatches.length}
              onShowAuth={handleShowAuth}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onUpdate={loadMatches}
          onShowAuth={handleShowAuth}
        />
      )}
      {showCreate && user?.role === 'host' && (
        <CreateMatchModal
          onClose={() => setShowCreate(false)}
          onCreated={handleMatchCreated}
        />
      )}
      {showAuth && (
        <AuthModal
          defaultTab={showAuth}
          onClose={() => setShowAuth(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
