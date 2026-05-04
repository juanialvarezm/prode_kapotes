# 🔐 Sistema de Autenticación - Prode Kapotes

## 📋 Descripción

Sistema robusto de autenticación que protege la aplicación contra accesos no autorizados y detecta automáticamente tokens vencidos o inválidos.

---

## ✨ Características Implementadas

### ✅ Validación Automática de Token
- Al cargar la app, verifica si el token es válido llamando a `/me`
- Si el token no existe o es inválido, redirige a `/auth`

### ✅ Detección de Token Vencido
- **Interceptor de Axios** detecta errores 401/403 automáticamente
- Logout y limpieza automática cuando el token expira
- Notificación al usuario cuando la sesión expira

### ✅ Protección de Rutas
- Todas las rutas requieren autenticación excepto `/auth`
- Redirige automáticamente a usuarios no autenticados

### ✅ Manejo Centralizado
- **Hook `useAuth`**: Lógica de autenticación centralizada
- **Utils `authUtils`**: Funciones helper para tokens
- **Interceptor**: Detección automática de errores de auth

---

## 📁 Archivos Creados/Modificados

### Nuevos Archivos

#### `front/src/hooks/useAuth.js`
Hook personalizado para manejar la autenticación.

**Proporciona:**
- `isAuthenticated`: Boolean que indica si el usuario está autenticado
- `isLoading`: Boolean que indica si se está validando el token
- `user`: Datos del usuario autenticado
- `logout()`: Función para cerrar sesión
- `validateToken()`: Función para re-validar el token

**Ejemplo de uso:**
```jsx
import { useAuth } from './hooks/useAuth';

function MiComponente() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  
  if (isLoading) return <p>Cargando...</p>;
  if (!isAuthenticated) return <Navigate to="/auth" />;
  
  return (
    <div>
      <p>Bienvenido, {user?.username}</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}
```

#### `front/src/utils/authUtils.js`
Utilidades para manejo de autenticación.

**Funciones:**
- `getToken()`: Obtiene el token de localStorage
- `setToken(token)`: Guarda el token
- `clearAuth()`: Limpia token y datos relacionados
- `hasToken()`: Verifica si existe un token
- `handleLogout(navigate)`: Maneja logout y redirección
- `isAuthError(error)`: Verifica si un error es de autenticación (401/403)

**Ejemplo de uso:**
```javascript
import { isAuthError, handleLogout } from './utils/authUtils';

try {
  await apiCall();
} catch (error) {
  if (isAuthError(error)) {
    handleLogout(navigate);
  }
}
```

#### `front/src/components/ProtectedRoute.jsx`
Componente para proteger rutas individuales (opcional).

**Ejemplo de uso:**
```jsx
<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  } 
/>
```

### Archivos Modificados

#### `front/src/api.js`
**Cambios:**
- ✅ Agregado **Interceptor de Axios** para detectar errores 401/403
- ✅ Logout automático cuando el token vence
- ✅ Notificación al usuario cuando la sesión expira

**Cómo funciona:**
```javascript
// Interceptor detecta respuesta del servidor
axios.interceptors.response.use(
  (response) => response,  // Si OK, retorna respuesta
  (error) => {
    // Si error 401/403, token vencido
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Limpiar token y redirigir a /auth
      handleLogout();
      alert('Tu sesión ha expirado');
    }
    return Promise.reject(error);
  }
);
```

#### `front/src/App.jsx`
**Cambios:**
- ✅ Usa `useAuth()` para validar autenticación
- ✅ Muestra loading mientras valida el token
- ✅ Pasa función `logout` al Header
- ✅ Verifica autenticación antes de cargar grupos

**Flujo:**
1. App carga → `useAuth()` valida token
2. Si no hay token → Redirige a `/auth`
3. Si hay token pero es inválido → Logout automático
4. Si token válido → Carga la app normalmente

#### `front/src/components/Header.jsx`
**Cambios:**
- ✅ Recibe prop `onLogout` desde App
- ✅ Usa la función de logout del hook (centralizado)
- ✅ Fallback al método anterior si no hay prop

---

## 🔄 Flujo de Autenticación

### 1. Usuario Inicia Sesión
```
Usuario ingresa credentials → POST /login
                           ↓
                    Backend valida
                           ↓
                  Retorna access_token
                           ↓
              Frontend guarda en localStorage
                           ↓
                   Redirige a /home
```

### 2. App Valida Token al Cargar
```
App carga → useAuth hook
              ↓
        Token existe?
              ↓
         Sí        No
         ↓         ↓
    GET /me    Redirect /auth
         ↓
    Token válido?
         ↓
    Sí        No
    ↓         ↓
  OK      Logout + Redirect /auth
```

### 3. Detección de Token Vencido Durante Uso
```
Usuario navega → Hace request API
                      ↓
                Interceptor captura
                      ↓
            Error 401/403 detectado
                      ↓
              Logout automático
                      ↓
         Alert "Sesión expirada"
                      ↓
            Redirect a /auth
```

---

## 🛡️ Protección Implementada

### Nivel 1: Validación al Cargar App
- Hook `useAuth` valida token con el backend
- Si no es válido → Logout inmediato

### Nivel 2: Interceptor de Axios
- Cada request protegido pasa por interceptor
- Si retorna 401/403 → Logout automático
- Notifica al usuario

### Nivel 3: Guards en Rutas
- `App.jsx` verifica `isAuthenticated`
- Redirige a `/auth` si no está autenticado

### Nivel 4: Backend JWT
- Backend valida token con `@jwt_required()`
- Retorna 401 si token inválido/vencido

---

## 🧪 Casos de Uso

### Caso 1: Token Válido
```
✅ Usuario navega normalmente
✅ Todos los requests tienen Authorization header
✅ Backend valida y procesa
```

### Caso 2: Sin Token
```
❌ App detecta que no hay token
⚠️  Redirige a /auth inmediatamente
🔄 Usuario debe iniciar sesión
```

### Caso 3: Token Vencido
```
❌ Usuario hace request → Backend retorna 401
🔴 Interceptor detecta error 401
⚠️  Muestra alert "Sesión expirada"
🧹 Limpia localStorage
🔄 Redirige a /auth
```

### Caso 4: Token Inválido/Corrupto
```
❌ Hook useAuth llama GET /me → Error 401
🔴 Hook detecta token inválido
🧹 Hace logout automático
🔄 Redirige a /auth
```

---

## 🔧 Configuración

### Variables de Entorno
```bash
# .env (frontend)
VITE_API_URL=https://tu-api.com
```

### Configuración JWT en Backend
```python
# init.py
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key')
```

**⚠️ IMPORTANTE:** En producción, usar una clave secreta fuerte y única.

---

## 🐛 Debugging

### Ver Token Actual
```javascript
console.log('Token:', localStorage.getItem('token'));
```

### Verificar Si Token Es Válido
```javascript
import { getMe } from './api';

getMe()
  .then(res => console.log('✅ Token válido:', res.data))
  .catch(err => console.log('❌ Token inválido:', err));
```

### Simular Token Vencido
```javascript
// En consola del navegador
localStorage.setItem('token', 'token_invalido_123');
// Luego hacer un request
```

### Ver Interceptor en Acción
```javascript
// En api.js, agregar logs
axios.interceptors.response.use(
  (response) => {
    console.log('✅ Response OK:', response);
    return response;
  },
  (error) => {
    console.log('❌ Response Error:', error.response?.status);
    // ... resto del código
  }
);
```

---

## 📚 Referencias

- **JWT (JSON Web Tokens):** https://jwt.io/
- **Flask-JWT-Extended:** https://flask-jwt-extended.readthedocs.io/
- **Axios Interceptors:** https://axios-http.com/docs/interceptors
- **React Router:** https://reactrouter.com/

---

## ✅ Checklist de Implementación

- [x] Hook useAuth creado
- [x] AuthUtils creados
- [x] Interceptor de Axios agregado
- [x] App.jsx actualizado
- [x] Header.jsx actualizado
- [x] ProtectedRoute component creado
- [x] Detección de token vencido funcionando
- [x] Logout automático implementado
- [x] Notificación al usuario agregada
- [x] Sin errores de compilación

---

## 🚀 Testing

### Probar Sistema de Auth

1. **Login exitoso:**
   - Ir a `/auth`
   - Ingresar credenciales válidas
   - Verificar redirección a `/home`

2. **Sin token:**
   - Borrar localStorage: `localStorage.clear()`
   - Intentar acceder a cualquier ruta
   - Verificar redirección a `/auth`

3. **Token vencido:**
   - Modificar token: `localStorage.setItem('token', 'invalid')`
   - Hacer cualquier acción que llame a la API
   - Verificar logout automático + alert

4. **Logout:**
   - Click en botón "Salir"
   - Verificar limpieza de datos
   - Verificar redirección a `/auth`

---

## 💡 Mejoras Futuras (Opcionales)

- [ ] Refresh token automático antes de expiración
- [ ] Recordar sesión (Keep me logged in)
- [ ] Rate limiting en frontend
- [ ] Logs de actividad de usuario
- [ ] Whitelist de IPs (backend)
- [ ] 2FA (Two-Factor Authentication)
