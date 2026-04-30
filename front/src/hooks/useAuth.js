import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../api';

/**
 * Hook para manejar la autenticación del usuario
 * - Valida si el token existe y es válido
 * - Redirige a /auth si no hay token o está vencido
 * - Proporciona función de logout
 */
export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('groupId');
        setIsAuthenticated(false);
        setUser(null);
        navigate('/auth');
    };

    const validateToken = async () => {
        const token = localStorage.getItem('token');

        // No hay token
        if (!token) {
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
        }

        // Verificar si el token es válido llamando al backend
        try {
            const response = await getMe();
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            // Token inválido o vencido
            console.error('Token inválido o vencido:', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        validateToken();
    }, []);

    return {
        isAuthenticated,
        isLoading,
        user,
        logout,
        validateToken,
    };
}
