import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
    { to: '/app/dashboard', label: 'Dashboard' },
    { to: '/app/create', label: 'Create' },
    { to: '/app/links', label: 'Links' },
    { to: '/app/settings', label: 'Settings' },
];

export default function AppLayout() {
    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div>
                    <p className="eyebrow">Rice COMP 539</p>
                    <h1 className="sidebar-title">AtLink</h1>
                    <p className="sidebar-copy">
                        MVP console for creating short links and checking stored aliases.
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
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
