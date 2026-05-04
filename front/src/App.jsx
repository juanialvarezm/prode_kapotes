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
import { useAuth } from './hooks/useAuth';
import Wordle from './pages/Wordle';

// Protected Route Component - redirects to /auth if no token
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();

  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const hasGroups = groups.length > 0;

  const refreshGroups = async () => {
    if (!isAuthenticated) {
      setLoadingGroups(false);
      return;
    }
    try {
      const res = await getMyGroups();
      setGroups(res.data.groups || []);
    } catch (error) {
      console.error('Error al cargar grupos:', error);
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  const refreshPendingRequests = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await getMyPendingRequests();
      setPendingRequestsCount(res.data.total || 0);
    } catch {
      setPendingRequestsCount(0);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshGroups();
      refreshPendingRequests();
    }
  }, [isAuthenticated]);

  // Poll pending requests every 15 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(refreshPendingRequests, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Mostrar loading mientras se valida el token
  if (authLoading) {
    return (
      <div className="app-container">
        <div className="app-layout">
          <main className="app-main">
            <div className="card empty-state">
              <span className="empty-icon">🔐</span>
              <p>Verificando autenticación...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // No autenticado o en página de auth
  if (!isAuthenticated || isAuth) {
    return (
      <div className="app-container">
        <Routes>
          <Route path="/auth" element={<AuthPage onSuccess={() => { navigate('/'); window.location.reload(); }} />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </div>
    );
  }

  // Loading grupos
  if (loadingGroups) {
    return (
      <div className="app-container">
        <div className="app-layout">
          <Header hasGroups={false} pendingRequestsCount={0} onLogout={logout} />
          <main className="app-main">
            <div className="card empty-state">
              <span className="empty-icon">⏳</span>
              <p>Cargando...</p>
            </div>
          ) : (
            <Routes>
              {/* Public routes - no authentication needed */}
              <Route path="/" element={<HomePage />} />
              <Route path="/privacy" element={<PrivacyPage />} />

  return (
    <div className="app-container">
      <div className="app-layout">
        <Header hasGroups={hasGroups} pendingRequestsCount={pendingRequestsCount} onLogout={logout} />
        <main className="app-main">
          <Routes>
            {/* Always accessible */}
            <Route path="/join-group" element={<JoinGroupPage onGroupChange={refreshGroups} />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
