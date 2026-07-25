import { useState, useEffect, lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import GroupsPage from './pages/GroupsPage';
import JoinGroupPage from './pages/JoinGroupPage';
import ProfilePage from './pages/ProfilePage';
import RequestsPage from './pages/RequestsPage';
import GolTexto from './pages/GolTexto';
import FutLegacy from './pages/FutLegacy';
import HomePage from './pages/HomePage';
import PrivacyPage from './pages/PrivacyPage';
import Header from './components/Header';
import Footer from './components/Footer';
import VerifyEmailPage from './pages/VerifyEmailPage';
import { getMyGroups, getMyPendingRequests, getMe } from './api';
import Wordle from './pages/Wordle';

// Public SEO Landing Pages
import PublicGroupsPage from './pages/PublicGroupsPage';
import PublicMatchesPage from './pages/PublicMatchesPage';
import PublicGamesPage from './pages/PublicGamesPage';
import PublicStatsPage from './pages/PublicStatsPage';
import PublicRankingPage from './pages/PublicRankingPage';
import HowItWorksPage from './pages/HowItWorksPage';
import HelpPage from './pages/HelpPage';
import HelpArticlePage from './pages/HelpArticlePage';
import TermsPage from './pages/TermsPage';
import CookiesPage from './pages/CookiesPage';
import ContactPage from './pages/ContactPage';
import AboutUsPage from './pages/AboutUsPage';

const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const UsersSearchPage = lazy(() => import('./pages/UsersSearchPage'));
const FieldsPage = lazy(() => import('./pages/FieldsPage'));

// Protected Route Component - redirects to /auth if no token
//comment
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
  const [userPoints, setUserPoints] = useState(0);

  const hasGroups = groups.length > 0;

  const refreshGroups = async () => {
    if (!token) return;
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

  const refreshUserPoints = async () => {
    if (!token) return;
    try {
      const res = await getMe();
      setUserPoints(res.data.points || 0);
    } catch {
      setUserPoints(0);
    }
  };

  useEffect(() => {
    if (token) {
      refreshGroups();
      refreshPendingRequests();
      refreshUserPoints();
    }
  }, [token]);

  // Poll pending requests & points every 15 seconds
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      refreshPendingRequests();
      refreshUserPoints();
    }, 15000);
    return () => clearInterval(interval);
  }, [token]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Auth/verify pages render without Header/Footer
  if (location.pathname === '/auth' || location.pathname === '/verify-email') {
    return (
      <Routes>
        <Route path="/auth" element={
          <AuthPage onSuccess={() => {
            const from = location.state?.from;
            const destination = from ? (from.pathname + from.search + (from.hash || '')) : '/';
            navigate(destination);
            window.location.reload();
          }} />
        } />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      <div className="app-layout">
        <Header hasGroups={token ? hasGroups : false} pendingRequestsCount={pendingRequestsCount} userPoints={userPoints} />
        <main className="app-main">
          {loadingGroups ? (
            <div className="card empty-state">
              <span className="empty-icon">⏳</span>
              <p>Cargando...</p>
            </div>
          ) : (
            <Routes>
              {/* Public routes - no authentication needed for SEO & AdSense approval */}
              <Route path="/" element={<HomePage />} />
              <Route path="/grupos" element={<PublicGroupsPage />} />
              <Route path="/partidos" element={<PublicMatchesPage />} />
              <Route path="/minijuegos" element={<PublicGamesPage />} />
              <Route path="/estadisticas" element={<PublicStatsPage />} />
              <Route path="/ranking" element={<PublicRankingPage />} />
              <Route path="/como-funciona" element={<HowItWorksPage />} />
              <Route path="/ayuda" element={<HelpPage />} />
              <Route path="/ayuda/:slug" element={<HelpArticlePage />} />

              {/* Public Fields Directory */}
              <Route path="/canchas" element={
                <Suspense fallback={
                  <div className="card empty-state">
                    <span className="empty-icon">⏳</span>
                    <p>Cargando canchas...</p>
                  </div>
                }>
                  <FieldsPage />
                </Suspense>
              } />

              {/* Public Legal & Institutional Pages */}
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/politica-de-privacidad" element={<PrivacyPage />} />
              <Route path="/terminos-y-condiciones" element={<TermsPage />} />
              <Route path="/politica-de-cookies" element={<CookiesPage />} />
              <Route path="/contacto" element={<ContactPage />} />
              <Route path="/sobre-nosotros" element={<AboutUsPage />} />

              {/* Protected routes - redirect to /auth if not logged in */}
              <Route path="/join-group" element={<ProtectedRoute><JoinGroupPage onGroupChange={refreshGroups} /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/profile/:userId" element={
                <ProtectedRoute>
                  <Suspense fallback={
                    <div className="card empty-state">
                      <span className="empty-icon">⏳</span>
                      <p>Cargando perfil...</p>
                    </div>
                  }>
                    <UserProfilePage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute>
                  <Suspense fallback={
                    <div className="card empty-state">
                      <span className="empty-icon">⏳</span>
                      <p>Cargando buscador...</p>
                    </div>
                  }>
                    <UsersSearchPage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
              <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
              <Route path="/futwordle" element={<ProtectedRoute><Wordle /></ProtectedRoute>} />
              <Route path="/goltexto" element={<ProtectedRoute><GolTexto /></ProtectedRoute>} />
              <Route path="/futlegacy" element={<ProtectedRoute><FutLegacy /></ProtectedRoute>} />

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
