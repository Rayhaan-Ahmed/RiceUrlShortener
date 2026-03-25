import { Link, Outlet, useLocation } from 'react-router-dom';

const navItems = [
    { label: 'Dashboard', to: '/app/dashboard' },
    { label: 'Create', to: '/app/create' },
    { label: 'Links', to: '/app/links' },
    { label: 'Settings', to: '/app/settings' },
];

export default function AppLayout() {
    const location = useLocation();

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: '#f3f4f6' }}>
            <aside
                style={{
                    width: 240,
                    background: '#111827',
                    color: '#ffffff',
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 12, letterSpacing: 1, color: '#93c5fd' }}>ATLINK</div>
                    <h2 style={{ margin: '8px 0 0', fontSize: 24 }}>Management Console</h2>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.to;

                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                style={{
                                    textDecoration: 'none',
                                    color: '#ffffff',
                                    padding: '10px 12px',
                                    borderRadius: 10,
                                    background: isActive ? '#1f2937' : 'transparent',
                                    border: isActive ? '1px solid #374151' : '1px solid transparent',
                                    fontWeight: 600,
                                }}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div
                    style={{
                        marginTop: 'auto',
                        paddingTop: 20,
                        fontSize: 13,
                        color: '#9ca3af',
                        lineHeight: 1.6,
                    }}
                >
                    Frontend = management plane
                    <br />
                    Redirect hot path stays on backend
                </div>
            </aside>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <header
                    style={{
                        height: 72,
                        background: '#ffffff',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 24px',
                    }}
                >
                    <div>
                        <h1 style={{ margin: 0, fontSize: 20, color: '#111827' }}>AtLink</h1>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
                            URL Shortener Admin Dashboard
                        </p>
                    </div>

                    <div
                        style={{
                            padding: '10px 14px',
                            borderRadius: 10,
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            fontSize: 14,
                            color: '#374151',
                        }}
                    >
                        Demo User
                    </div>
                </header>

                <main style={{ flex: 1, padding: 24 }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}