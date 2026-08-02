// src/App.jsx
import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './index.css';
import { api } from './api/client';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import FilterBar from './components/FilterBar';
import MatchCard from './components/MatchCard';
import Sidebar from './components/Sidebar';
import MatchDetailModal from './components/MatchDetailModal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateMatchPage from './pages/CreateMatchPage';

function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [matches,        setMatches]        = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [error,          setError]          = useState(null);
  const [filters,        setFilters]        = useState({ district: '', gender_required: '', skill_level: '' });
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [initialTab, setInitialTab]       = useState('info');
  const [sortBy,         setSortBy]         = useState('time');

  function handleOpenMatch(match, tab = 'info') {
    setSelectedMatch(match);
    setInitialTab(tab);
  }

  const loadMatches = useCallback(async () => {
    setMatchesLoading(true); setError(null);
    try {
      const params = {};
      if (filters.district)        params.district        = filters.district;
      if (filters.gender_required) params.gender_required = filters.gender_required;
      if (filters.skill_level)     params.skill_level     = filters.skill_level;
      const data = await api.getMatches(params);
      setMatches(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setMatchesLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadMatches(); }, [loadMatches]);

  function handleShowAuth(tab) {
    if (tab === 'register') {
      navigate('/register');
    } else {
      navigate('/login');
    }
  }

  const openMatches = matches.filter(m => m.status !== 'cancelled');

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />
      <FilterBar filters={filters} onChange={setFilters} />

      <div className="container">
        <div className="main-layout">
          {/* Match list */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {openMatches.length} kèo đang mở
              </h2>
              <select
                className="filter-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="time">Giờ chơi gần nhất</option>
                <option value="created">Mới tạo</option>
              </select>
            </div>

            {matchesLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton" style={{ height: 100 }} />
                ))}
              </div>
            ) : error ? (
              <div className="panel-card" style={{ textAlign: 'center', padding: '48px 20px' }}>
                <h3 style={{ marginBottom: 6, fontSize: '0.95rem' }}>Không thể kết nối server</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 14, fontSize: '0.85rem' }}>{error}</p>
                <button className="btn btn-primary btn-sm" onClick={loadMatches}>Thử lại</button>
              </div>
            ) : openMatches.length === 0 ? (
              <div className="panel-card" style={{ textAlign: 'center', padding: '48px 20px' }}>
                <h3 style={{ marginBottom: 6, fontSize: '0.95rem' }}>Chưa có kèo nào</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.85rem' }}>Thử thay đổi bộ lọc hoặc tạo kèo mới</p>
                {user && (
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/create-match')}>+ Tạo kèo mới</button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {openMatches.map(m => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    onClick={match => handleOpenMatch(match, 'info')}
                    onRegisterClick={match => handleOpenMatch(match, 'join')}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="sidebar-column">
            <Sidebar openCount={openMatches.length} />
          </div>
        </div>
      </div>

      {/* Match details modal */}
      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          initialTab={initialTab}
          onClose={() => setSelectedMatch(null)}
          onUpdate={loadMatches}
          onShowAuth={handleShowAuth}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/create-match" element={<CreateMatchPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
