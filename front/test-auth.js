/**
 * Script de prueba para el sistema de autenticación
 * Ejecutar en la consola del navegador
 */

// ============================================================
// TEST 1: Verificar Token Actual
// ============================================================
console.log('🔍 TEST 1: Token actual');
const token = localStorage.getItem('token');
if (token) {
    console.log('✅ Token encontrado:', token.substring(0, 20) + '...');
} else {
    console.log('❌ No hay token guardado');
}

// ============================================================
// TEST 2: Validar Token con Backend
// ============================================================
console.log('\n🔍 TEST 2: Validando token con backend...');
fetch('https://prodekapotes-production.up.railway.app/me', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
    .then(res => {
        if (res.ok) {
            return res.json();
        } else {
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
    })
    .then(data => {
        console.log('✅ Token válido. Usuario:', data);
    })
    .catch(err => {
        console.log('❌ Token inválido:', err.message);
    });

// ============================================================
// TEST 3: Simular Token Vencido (Cuidado: te deslogueará)
// ============================================================
window.testExpiredToken = function () {
    console.log('⚠️  Simulando token vencido...');
    localStorage.setItem('token', 'token_invalido_para_testing');
    console.log('✅ Token corrupto guardado. Haz un request para ver el interceptor en acción.');
    console.log('💡 El sistema debería detectarlo automáticamente y hacer logout.');
};

console.log('\n💡 Para simular un token vencido, ejecuta: testExpiredToken()');

// ============================================================
// TEST 4: Ver Estado de Autenticación
// ============================================================
console.log('\n🔍 TEST 4: Estado de autenticación');
console.log('localStorage.token:', !!localStorage.getItem('token') ? '✅ Existe' : '❌ No existe');
console.log('localStorage.groupId:', localStorage.getItem('groupId') || 'No guardado');

// ============================================================
// TEST 5: Simular Logout Manual
// ============================================================
window.testLogout = function () {
    console.log('🚪 Simulando logout...');
    localStorage.removeItem('token');
    localStorage.removeItem('groupId');
    console.log('✅ Token eliminado. Recarga la página para ver el efecto.');
    setTimeout(() => window.location.reload(), 1000);
};

console.log('💡 Para probar logout, ejecuta: testLogout()');

// ============================================================
// TEST 6: Verificar Interceptor
// ============================================================
console.log('\n🔍 TEST 6: Estado del interceptor de Axios');
console.log('El interceptor está configurado para detectar errores 401/403');
console.log('Cuando ocurra un error de autenticación, verás:');
console.log('  1. Log en consola: "🔴 Token vencido..."');
console.log('  2. Alert: "Tu sesión ha expirado"');
console.log('  3. Redirección automática a /auth');

// ============================================================
// Helpers útiles
// ============================================================
window.authDebug = {
    getToken: () => localStorage.getItem('token'),
    setToken: (token) => localStorage.setItem('token', token),
    clearAuth: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('groupId');
    },
    checkToken: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('❌ No hay token');
            return;
        }

        try {
            const res = await fetch('https://prodekapotes-production.up.railway.app/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                console.log('✅ Token válido:', data);
            } else {
                console.log('❌ Token inválido:', res.status, res.statusText);
            }
        } catch (err) {
            console.log('❌ Error:', err.message);
        }
    }
};

console.log('\n💡 Helpers disponibles en window.authDebug:');
console.log('  - authDebug.getToken()');
console.log('  - authDebug.setToken(token)');
console.log('  - authDebug.clearAuth()');
console.log('  - authDebug.checkToken()');

console.log('\n✅ Tests de autenticación cargados correctamente');
