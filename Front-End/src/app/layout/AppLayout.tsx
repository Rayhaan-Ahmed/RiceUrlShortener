import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

const navItems = [
    { to: '/app/dashboard', label: 'Dashboard' },
    { to: '/app/create', label: 'Create' },
    { to: '/app/links', label: 'Links' },
    { to: '/app/settings', label: 'Settings' },
];

export default function AppLayout() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div>
                    <p className="eyebrow">Rice COMP 539</p>
                    <h1 className="sidebar-title">AtLink</h1>
                    <p className="sidebar-copy">
                        Authenticated management console for creating short links and checking stored aliases.
                    </p>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button type="button" className="user-chip" onClick={() => navigate('/app/settings')}>
                        {user?.name ?? user?.email ?? 'User'}
                    </button>
                    <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                    >
                        Logout
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
