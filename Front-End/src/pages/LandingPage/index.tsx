import { Link } from 'react-router-dom';

export default function LandingPage() {
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
                    maxWidth: 900,
                    background: '#ffffff',
                    borderRadius: 16,
                    padding: 40,
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08)',
                }}
            >
                <div style={{ marginBottom: 24 }}>
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
                    <h1
                        style={{
                            margin: '12px 0 16px',
                            fontSize: 42,
                            lineHeight: 1.15,
                            color: '#111827',
                        }}
                    >
                        A simple and reliable URL shortener management console
                    </h1>
                    <p
                        style={{
                            margin: 0,
                            maxWidth: 680,
                            fontSize: 17,
                            lineHeight: 1.6,
                            color: '#4b5563',
                        }}
                    >
                        Create short links, manage aliases, and view aggregated analytics in a
                        clean React-based management plane. Redirect traffic stays on the backend
                        hot path for low latency.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                    <Link
                        to="/login"
                        style={{
                            display: 'inline-block',
                            padding: '12px 20px',
                            borderRadius: 10,
                            background: '#111827',
                            color: '#ffffff',
                            textDecoration: 'none',
                            fontWeight: 600,
                        }}
                    >
                        Sign In
                    </Link>

                    <Link
                        to="/signup"
                        style={{
                            display: 'inline-block',
                            padding: '12px 20px',
                            borderRadius: 10,
                            background: '#ffffff',
                            color: '#111827',
                            border: '1px solid #d1d5db',
                            textDecoration: 'none',
                            fontWeight: 600,
                        }}
                    >
                        Get Started
                    </Link>
                </div>

                <div
                    style={{
                        marginTop: 36,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                        gap: 16,
                    }}
                >
                    <div
                        style={{
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: 12,
                            padding: 16,
                        }}
                    >
                        <h3 style={{ marginTop: 0, marginBottom: 8 }}>Management Plane</h3>
                        <p style={{ margin: 0, color: '#6b7280', lineHeight: 1.5 }}>
                            Users create and manage short links through the React web app.
                        </p>
                    </div>

                    <div
                        style={{
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: 12,
                            padding: 16,
                        }}
                    >
                        <h3 style={{ marginTop: 0, marginBottom: 8 }}>Low-Latency Redirect</h3>
                        <p style={{ margin: 0, color: '#6b7280', lineHeight: 1.5 }}>
                            Redirect requests bypass the frontend and go directly to backend services.
                        </p>
                    </div>

                    <div
                        style={{
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: 12,
                            padding: 16,
                        }}
                    >
                        <h3 style={{ marginTop: 0, marginBottom: 8 }}>Aggregated Analytics</h3>
                        <p style={{ margin: 0, color: '#6b7280', lineHeight: 1.5 }}>
                            View summary-level click and usage insights without exposing raw logs.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}