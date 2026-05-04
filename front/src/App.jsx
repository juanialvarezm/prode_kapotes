import { useState, useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import GroupsPage from './pages/GroupsPage';
import JoinGroupPage from './pages/JoinGroupPage';
import ProfilePage from './pages/ProfilePage';
import MatchesPage from './pages/MatchesPage';
import MatchDetail from './pages/MatchDetail';
import PredictionsPage from './pages/PredictionsPage';
import RequestsPage from './pages/RequestsPage';
import GolTexto from './pages/GolTexto';
import FutLegacy from './pages/FutLegacy';
import HomePage from './pages/HomePage';
import PrivacyPage from './pages/PrivacyPage';
import Header from './components/Header';
import Footer from './components/Footer';
import { getMyGroups, getMyPendingRequests } from './api';
import Wordle from './pages/Wordle';

// Protected Route Component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();

  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const hasGroups = groups.length > 0;
  const isAuth = location.pathname === '/auth';
  const isHome = location.pathname === '/' || location.pathname === '/home';
  const isPrivacy = location.pathname === '/privacy';

  // List of protected routes
  const protectedRoutes = [
    '/join-group', '/profile', '/requests', '/groups', '/matches',
    '/predictions', '/futwordle', '/goltexto', '/futlegacy'
  ];
  const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));

  const refreshGroups = async () => {
    if (!token) { setLoadingGroups(false); return; }
    setLoadingGroups(true);
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
    if (token) {
      refreshGroups();
      refreshPendingRequests();
    }
  }, [token]);

  // Poll pending requests every 15 seconds
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(refreshPendingRequests, 15000);
    return () => clearInterval(interval);
  }, [token]);

  // Auth page - accessible to all
  if (isAuth) {
    return (
      <div className="app-container">
        <Routes>
          <Route path="/auth" element={<AuthPage onSuccess={() => { navigate('/'); window.location.reload(); }} />} />
        </Routes>
      </div>
    );
  }

  // Redirect to auth if trying to access protected routes without token
  if (!token && isProtectedRoute) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Public pages (home and privacy) - accessible without login
  if ((isHome || isPrivacy) && !token) {
    return (
      <div className="app-container">
        <div className="app-layout">
          <Header hasGroups={false} pendingRequestsCount={0} />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  // Loading state for authenticated users
  if (token && loadingGroups) {
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

  // Main app layout with all routes
  return (
    <div className="app-container">
      <div className="app-layout">
        <Header hasGroups={token ? hasGroups : false} pendingRequestsCount={pendingRequestsCount} />
        <main className="app-main">
          <Routes>
            {/* Public routes - accessible without authentication */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            {/* Protected routes - require authentication */}
            <Route path="/join-group" element={<ProtectedRoute><JoinGroupPage onGroupChange={refreshGroups} /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
            <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
            <Route path="/matches" element={<ProtectedRoute><MatchesPage /></ProtectedRoute>} />
            <Route path="/matches/:matchId" element={<ProtectedRoute><MatchDetail /></ProtectedRoute>} />
            <Route path="/predictions" element={<ProtectedRoute><PredictionsPage /></ProtectedRoute>} />
            <Route path="/futwordle" element={<ProtectedRoute><Wordle /></ProtectedRoute>} />
            <Route path="/goltexto" element={<ProtectedRoute><GolTexto /></ProtectedRoute>} />
            <Route path="/futlegacy" element={<ProtectedRoute><FutLegacy /></ProtectedRoute>} />

            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
