import { useState, useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import GroupsPage from './pages/GroupsPage';
import JoinGroupPage from './pages/JoinGroupPage';
import ProfilePage from './pages/ProfilePage';
import MatchesPage from './pages/MatchesPage';
import ChallengePage from './pages/ChallengePage';
import RequestsPage from './pages/RequestsPage';
import Header from './components/Header';
import Footer from './components/Footer';
import { getMyGroups, getMyPendingRequests } from './api';

function App() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();

  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

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

  const refreshPendingRequests = async () => {
    if (!token) return;
    try {
      const res = await getMyPendingRequests();
      setPendingRequestsCount(res.data.total || 0);
    } catch {
      setPendingRequestsCount(0);
    }
  };

  useEffect(() => {
    refreshGroups();
    refreshPendingRequests();
  }, [token]);

  // Poll pending requests every 15 seconds
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(refreshPendingRequests, 15000);
    return () => clearInterval(interval);
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
          <Header hasGroups={false} pendingRequestsCount={0} />
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
        <Header hasGroups={hasGroups} pendingRequestsCount={pendingRequestsCount} />
        <main className="app-main">
          <Routes>
            {/* Always accessible */}
            <Route path="/join-group" element={<JoinGroupPage onGroupChange={refreshGroups} />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/requests" element={<RequestsPage />} />

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
