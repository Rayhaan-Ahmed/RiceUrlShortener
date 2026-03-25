import { Link } from 'react-router-dom';

type MetricCardProps = {
    title: string;
    value: string;
    hint: string;
};

type RecentLink = {
    alias: string;
    shortUrl: string;
    longUrl: string;
    status: 'Active' | 'Expired';
    clicks: number;
    createdAt: string;
};

const metrics: MetricCardProps[] = [
    {
        title: 'Total Links',
        value: '128',
        hint: 'All links created by this account',
    },
    {
        title: 'Active Links',
        value: '104',
        hint: 'Currently available for redirect',
    },
    {
        title: 'Total Clicks',
        value: '18,420',
        hint: 'Aggregated redirects across all links',
    },
    {
        title: 'Expired Links',
        value: '24',
        hint: 'No longer available for redirect',
    },
];

const recentLinks: RecentLink[] = [
    {
        alias: 'spring-launch',
        shortUrl: 'https://at.link/spring-launch',
        longUrl: 'https://example.com/campaigns/spring-launch',
        status: 'Active',
        clicks: 1248,
        createdAt: '2026-03-22',
    },
    {
        alias: 'cs-course-notes',
        shortUrl: 'https://at.link/cs-course-notes',
        longUrl: 'https://example.com/resources/comp-539-notes',
        status: 'Active',
        clicks: 392,
        createdAt: '2026-03-19',
    },
    {
        alias: 'old-promo-2025',
        shortUrl: 'https://at.link/old-promo-2025',
        longUrl: 'https://example.com/archive/old-promo',
        status: 'Expired',
        clicks: 86,
        createdAt: '2026-02-28',
    },
    {
        alias: 'team-demo',
        shortUrl: 'https://at.link/team-demo',
        longUrl: 'https://example.com/demo/system-design',
        status: 'Active',
        clicks: 731,
        createdAt: '2026-03-20',
    },
];

function MetricCard({ title, value, hint }: MetricCardProps) {
    return (
        <div
            style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 16,
                padding: 20,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
            }}
        >
            <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 10 }}>{title}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
                {value}
            </div>
            <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5 }}>{hint}</div>
        </div>
    );
}

function StatusBadge({ status }: { status: RecentLink['status'] }) {
    const isActive = status === 'Active';

    return (
        <span
            style={{
                display: 'inline-block',
                padding: '6px 10px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                background: isActive ? '#ecfdf5' : '#fef2f2',
                color: isActive ? '#047857' : '#b91c1c',
                border: isActive ? '1px solid #a7f3d0' : '1px solid #fecaca',
            }}
        >
      {status}
    </span>
    );
}

export default function DashboardPage() {
    return (
        <div style={{ display: 'grid', gap: 24 }}>
            <section
                style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 20,
                    padding: 24,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 16,
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: '#2563eb',
                                letterSpacing: 0.5,
                                marginBottom: 10,
                            }}
                        >
                            DASHBOARD
                        </div>
                        <h2 style={{ margin: 0, fontSize: 32, color: '#111827' }}>
                            Welcome back to AtLink
                        </h2>
                        <p
                            style={{
                                margin: '12px 0 0',
                                maxWidth: 760,
                                color: '#6b7280',
                                lineHeight: 1.7,
                                fontSize: 15,
                            }}
                        >
                            This dashboard is the management plane for the URL shortener system.
                            Users create and manage links here, while redirect traffic bypasses the
                            frontend and goes directly to backend services for low-latency handling.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <Link
                            to="/app/create"
                            style={{
                                textDecoration: 'none',
                                background: '#111827',
                                color: '#ffffff',
                                padding: '12px 16px',
                                borderRadius: 10,
                                fontWeight: 600,
                            }}
                        >
                            Create New Link
                        </Link>

                        <Link
                            to="/app/links"
                            style={{
                                textDecoration: 'none',
                                background: '#ffffff',
                                color: '#111827',
                                padding: '12px 16px',
                                borderRadius: 10,
                                fontWeight: 600,
                                border: '1px solid #d1d5db',
                            }}
                        >
                            View All Links
                        </Link>
                    </div>
                </div>
            </section>

            <section
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                    gap: 16,
                }}
            >
                {metrics.map((metric) => (
                    <MetricCard
                        key={metric.title}
                        title={metric.title}
                        value={metric.value}
                        hint={metric.hint}
                    />
                ))}
            </section>

            <section
                style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: 20,
                    alignItems: 'start',
                }}
            >
                <div
                    style={{
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 16,
                        padding: 20,
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
                        overflowX: 'auto',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 12,
                            marginBottom: 18,
                        }}
                    >
                        <div>
                            <h3 style={{ margin: 0, color: '#111827' }}>Recent Links</h3>
                            <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>
                                A quick overview of recently created short links.
                            </p>
                        </div>

                        <Link
                            to="/app/links"
                            style={{
                                textDecoration: 'none',
                                color: '#2563eb',
                                fontWeight: 600,
                                fontSize: 14,
                            }}
                        >
                            See more
                        </Link>
                    </div>

                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            minWidth: 720,
                        }}
                    >
                        <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ padding: '12px 8px', fontSize: 13, color: '#6b7280' }}>Alias</th>
                            <th style={{ padding: '12px 8px', fontSize: 13, color: '#6b7280' }}>
                                Short URL
                            </th>
                            <th style={{ padding: '12px 8px', fontSize: 13, color: '#6b7280' }}>
                                Long URL
                            </th>
                            <th style={{ padding: '12px 8px', fontSize: 13, color: '#6b7280' }}>Status</th>
                            <th style={{ padding: '12px 8px', fontSize: 13, color: '#6b7280' }}>Clicks</th>
                            <th style={{ padding: '12px 8px', fontSize: 13, color: '#6b7280' }}>
                                Created
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {recentLinks.map((link) => (
                            <tr key={link.alias} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '14px 8px', fontWeight: 600, color: '#111827' }}>
                                    <Link
                                        to={`/app/links/${link.alias}`}
                                        style={{ textDecoration: 'none', color: '#111827' }}
                                    >
                                        {link.alias}
                                    </Link>
                                </td>
                                <td style={{ padding: '14px 8px', color: '#2563eb' }}>{link.shortUrl}</td>
                                <td
                                    style={{
                                        padding: '14px 8px',
                                        color: '#4b5563',
                                        maxWidth: 280,
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {link.longUrl}
                                </td>
                                <td style={{ padding: '14px 8px' }}>
                                    <StatusBadge status={link.status} />
                                </td>
                                <td style={{ padding: '14px 8px', color: '#111827' }}>{link.clicks}</td>
                                <td style={{ padding: '14px 8px', color: '#6b7280' }}>{link.createdAt}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: 'grid', gap: 20 }}>
                    <div
                        style={{
                            background: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: 16,
                            padding: 20,
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
                        }}
                    >
                        <h3 style={{ marginTop: 0, color: '#111827' }}>Quick Actions</h3>
                        <div style={{ display: 'grid', gap: 12 }}>
                            <Link
                                to="/app/create"
                                style={{
                                    textDecoration: 'none',
                                    padding: '12px 14px',
                                    borderRadius: 10,
                                    background: '#111827',
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    textAlign: 'center',
                                }}
                            >
                                Create a New Link
                            </Link>

                            <Link
                                to="/app/links"
                                style={{
                                    textDecoration: 'none',
                                    padding: '12px 14px',
                                    borderRadius: 10,
                                    background: '#ffffff',
                                    color: '#111827',
                                    border: '1px solid #d1d5db',
                                    fontWeight: 600,
                                    textAlign: 'center',
                                }}
                            >
                                Go to Link List
                            </Link>
                        </div>
                    </div>

                    <div
                        style={{
                            background: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: 16,
                            padding: 20,
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
                        }}
                    >
                        <h3 style={{ marginTop: 0, color: '#111827' }}>System Notes</h3>
                        <ul
                            style={{
                                margin: 0,
                                paddingLeft: 18,
                                color: '#6b7280',
                                lineHeight: 1.7,
                                fontSize: 14,
                            }}
                        >
                            <li>Frontend handles management workflows only.</li>
                            <li>Redirect requests should bypass the React app.</li>
                            <li>Analytics shown here are aggregated summaries.</li>
                            <li>Cursor-based pagination will be used for link lists.</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
}