/**
 * Utilidades para manejo de autenticación
 */

/**
 * Obtiene el token del localStorage
 */
export function getToken() {
    return localStorage.getItem('token');
}

/**
 * Guarda el token en localStorage
 */
export function setToken(token) {
    localStorage.setItem('token', token);
}

/**
 * Elimina el token y datos relacionados
 */
export function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('groupId');
}

/**
 * Verifica si hay un token guardado
 */
export function hasToken() {
    return !!getToken();
}

/**
 * Maneja el logout y limpieza
 */
export function handleLogout(navigate) {
    clearAuth();
    if (navigate) {
        navigate('/auth', { replace: true });
    } else {
        window.location.href = '/auth';
    }
}

/**
 * Verifica si el error es de autenticación (401/403)
 */
export function isAuthError(error) {
    return error?.response?.status === 401 || error?.response?.status === 403;
}
