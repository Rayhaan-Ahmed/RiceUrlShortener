import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';

export default function SignupPage() {
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signup({ name, email, password });
            navigate('/app/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f7f8fa',
                padding: 24,
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: 420,
                    background: '#ffffff',
                    borderRadius: 16,
                    padding: 40,
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08)',
                }}
            >
                <p
                    style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#2563eb',
                        letterSpacing: 0.5,
                    }}
                >
                    ATLINK
                </p>
                <h1 style={{ margin: '12px 0 28px', fontSize: 26, color: '#111827' }}>
                    Create your account
                </h1>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#374151' }}>
                            Username
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: 10,
                                border: '1px solid #d1d5db',
                                fontSize: 15,
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#374151' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: 10,
                                border: '1px solid #d1d5db',
                                fontSize: 15,
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#374151' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: 10,
                                border: '1px solid #d1d5db',
                                fontSize: 15,
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    {error && (
                        <p style={{ margin: 0, color: '#dc2626', fontSize: 14 }}>{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '12px 20px',
                            borderRadius: 10,
                            background: loading ? '#6b7280' : '#111827',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: 15,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginTop: 4,
                        }}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: '#6b7280' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
