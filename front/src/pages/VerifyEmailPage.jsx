import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail } from '../api';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setMessage('Token de verificación no encontrado.');
            return;
        }

        verifyEmail(token)
            .then((res) => {
                setStatus('success');
                setMessage(res.data.message || 'Email verificado correctamente.');
            })
            .catch((err) => {
                setStatus('error');
                setMessage(err?.response?.data?.error || 'El link de verificación es inválido o ya fue utilizado.');
            });
    }, [searchParams]);

    return (
        <div className="auth-wrapper">
            <div className="auth-card" style={{ textAlign: 'center' }}>
                <h2 className="auth-title">
                    <span className="brand-gradient">Prode Kapotes</span>
                </h2>

                {status === 'loading' && (
                    <p className="auth-subtitle">Verificando tu email...</p>
                )}

                {status === 'success' && (
                    <>
                        <p style={{ fontSize: '2.5rem', margin: '12px 0' }}>✅</p>
                        <p className="auth-subtitle">{message}</p>
                        <Link to="/auth">
                            <button className="auth-btn" style={{ marginTop: '16px' }}>
                                🚀 Iniciar sesión
                            </button>
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <p style={{ fontSize: '2.5rem', margin: '12px 0' }}>❌</p>
                        <p className="auth-subtitle" style={{ color: '#ef4444' }}>{message}</p>
                        <Link to="/auth">
                            <button className="auth-btn" style={{ marginTop: '16px' }}>
                                Volver al login
                            </button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
