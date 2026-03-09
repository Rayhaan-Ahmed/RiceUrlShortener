import { Link, Outlet } from 'react-router-dom';

export default function AppLayout() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <aside
                style={{
                    width: 220,
                    background: '#111827',
                    color: '#ffffff',
                    padding: 16,
                }}
            >
                <h2 style={{ marginTop: 0 }}>AtLink</h2>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Link to="/app/dashboard" style={{ color: '#ffffff', textDecoration: 'none' }}>
                        Dashboard
                    </Link>
                    <Link to="/app/create" style={{ color: '#ffffff', textDecoration: 'none' }}>
                        Create
                    </Link>
                    <Link to="/app/links" style={{ color: '#ffffff', textDecoration: 'none' }}>
                        Links
                    </Link>
                    <Link to="/app/settings" style={{ color: '#ffffff', textDecoration: 'none' }}>
                        Settings
                    </Link>
                </nav>
            </aside>

            <main style={{ flex: 1, padding: 24 }}>
                <Outlet />
            </main>
        </div>
    );
}