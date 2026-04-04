import { useState, useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import GroupsPage from './pages/GroupsPage';
import JoinGroupPage from './pages/JoinGroupPage';
import ProfilePage from './pages/ProfilePage';
import MatchesPage from './pages/MatchesPage';
import ChallengePage from './pages/ChallengePage';
import Header from './components/Header';
import Footer from './components/Footer';
import { getMyGroups } from './api';

function App() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();

  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const hasGroups = groups.length > 0;
  const isAuth = location.pathname === '/auth';

  const refreshGroups = async () => {
    if (!token) { setLoadingGroups(false); return; }
    try {
      const res = await getMyGroups();
      setGroups(res.data.groups || []);
    } catch {
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    refreshGroups();
  }, [token]);

  // Not logged in or on auth page
  if (!token || isAuth) {
    return (
      <div className="app-container">
        <Routes>
          <Route path="/auth" element={<AuthPage onSuccess={() => { navigate('/'); window.location.reload(); }} />} />
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </div>
    );
  }

  // Loading state
  if (loadingGroups) {
    return (
      <div className="app-container">
        <div className="app-layout">
          <Header hasGroups={false} />
          <main className="app-main">
            <div className="card empty-state">
              <span className="empty-icon">⏳</span>
              <p>Cargando...</p>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="app-layout">
        <Header hasGroups={hasGroups} />
        <main className="app-main">
          <Routes>
            {/* Always accessible */}
            <Route path="/join-group" element={<JoinGroupPage onGroupChange={refreshGroups} />} />
            <Route path="/profile" element={<ProfilePage />} />

            {hasGroups ? (
              <>
                <Route path="/" element={<GroupsPage />} />
                <Route path="/groups" element={<GroupsPage />} />
                <Route path="/matches" element={<MatchesPage />} />
                <Route path="/challenge" element={<ChallengePage />} />
                <Route path="*" element={<Navigate to="/groups" />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/join-group" />} />
            )}
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
