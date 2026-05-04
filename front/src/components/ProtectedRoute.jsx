import { Navigate } from 'react-router-dom';
import { hasToken } from '../utils/authUtils';

/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige a /auth si no hay token válido
 * 
 * Uso:
 * <ProtectedRoute>
 *   <MiComponente />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({ children }) {
    if (!hasToken()) {
        // Si no hay token, redirigir a la página de autenticación
        return <Navigate to="/auth" replace />;
    }

    // Si hay token, renderizar el componente hijo
    return children;
}
