import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';

type LinkStatus = 'Active' | 'Expired' | 'Disabled';

type LinkItem = {
    alias: string;
    shortUrl: string;
    longUrl: string;
    status: LinkStatus;
    clicks: number;
    createdAt: string;
    expiresAt?: string;
};

const initialLinks: LinkItem[] = [
    {
        alias: 'spring-launch',
        shortUrl: 'https://at.link/spring-launch',
        longUrl: 'https://example.com/campaigns/spring-launch',
        status: 'Active',
        clicks: 1248,
        createdAt: '2026-03-22',
        expiresAt: '2026-06-01 23:59',
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
        expiresAt: '2026-03-10 00:00',
    },
    {
        alias: 'team-demo',
        shortUrl: 'https://at.link/team-demo',
        longUrl: 'https://example.com/demo/system-design',
        status: 'Active',
        clicks: 731,
        createdAt: '2026-03-20',
    },
    {
        alias: 'internal-preview',
        shortUrl: 'https://at.link/internal-preview',
        longUrl: 'https://example.com/internal/preview-build',
        status: 'Disabled',
        clicks: 51,
        createdAt: '2026-03-14',
    },
    {
        alias: 'launch-deck',
        shortUrl: 'https://at.link/launch-deck',
        longUrl: 'https://example.com/slides/launch-deck-v3',
        status: 'Active',
        clicks: 915,
        createdAt: '2026-03-23',
    },
];

function StatusBadge({ status }: { status: LinkStatus }) {
    const styleMap: Record<LinkStatus, React.CSSProperties> = {
        Active: {
            background: '#ecfdf5',
            color: '#047857',
            border: '1px solid #a7f3d0',
        },
        Expired: {
            background: '#fef2f2',
            color: '#b91c1c',
            border: '1px solid #fecaca',
        },
        Disabled: {
            background: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
        },
    };

    return (
        <span
            style={{
                display: 'inline-block',
                padding: '6px 10px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                ...styleMap[status],
            }}
        >
      {status}
    </span>
    );
}

export default function LinksPage() {
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | LinkStatus>('All');
    const [copiedAlias, setCopiedAlias] = useState('');

    const filteredLinks = useMemo(() => {
        return initialLinks.filter((item) => {
            const matchesSearch =
                item.alias.toLowerCase().includes(searchText.toLowerCase()) ||
                item.longUrl.toLowerCase().includes(searchText.toLowerCase()) ||
                item.shortUrl.toLowerCase().includes(searchText.toLowerCase());

            const matchesStatus = statusFilter === 'All' ? true : item.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [searchText, statusFilter]);

    async function handleCopy(shortUrl: string, alias: string) {
        try {
            await navigator.clipboard.writeText(shortUrl);
            setCopiedAlias(alias);
            window.setTimeout(() => setCopiedAlias(''), 1500);
        } catch {
            window.alert('Copy failed. Your browser may not allow clipboard access.');
        }
    }

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
                            LINKS
                        </div>
                        <h2 style={{ margin: 0, fontSize: 30, color: '#111827' }}>Manage Your Links</h2>
                        <p
                            style={{
                                margin: '12px 0 0',
                                maxWidth: 760,
                                color: '#6b7280',
                                lineHeight: 1.7,
                                fontSize: 15,
                            }}
                        >
                            Browse, filter, and inspect your short links. This page represents the
                            management API view of the system, not the redirect hot path.
                        </p>
                    </div>

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
                </div>
            </section>

            <section
                style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 16,
                    padding: 20,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        gap: 14,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                    }}
                >
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search by alias, short URL, or long URL"
                        style={{
                            flex: '1 1 320px',
                            minWidth: 260,
                            padding: '12px 14px',
                            borderRadius: 10,
                            border: '1px solid #d1d5db',
                            fontSize: 14,
                        }}
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as 'All' | LinkStatus)}
                        style={{
                            padding: '12px 14px',
                            borderRadius: 10,
                            border: '1px solid #d1d5db',
                            fontSize: 14,
                            background: '#ffffff',
                        }}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Expired">Expired</option>
                        <option value="Disabled">Disabled</option>
                    </select>
                </div>

                <div
                    style={{
                        marginTop: 14,
                        fontSize: 14,
                        color: '#6b7280',
                    }}
                >
                    Showing <strong style={{ color: '#111827' }}>{filteredLinks.length}</strong> link
                    {filteredLinks.length === 1 ? '' : 's'}
                </div>
            </section>

            <section
                style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 16,
                    padding: 20,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
                    overflowX: 'auto',
                }}
            >
                <table
                    style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        minWidth: 980,
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
                        <th style={{ padding: '12px 8px', fontSize: 13, color: '#6b7280' }}>Created</th>
                        <th style={{ padding: '12px 8px', fontSize: 13, color: '#6b7280' }}>Expires</th>
                        <th style={{ padding: '12px 8px', fontSize: 13, color: '#6b7280' }}>Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {filteredLinks.map((item) => (
                        <tr key={item.alias} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '14px 8px', fontWeight: 600 }}>
                                <Link
                                    to={`/app/links/${item.alias}`}
                                    style={{ textDecoration: 'none', color: '#111827' }}
                                >
                                    {item.alias}
                                </Link>
                            </td>

                            <td style={{ padding: '14px 8px', color: '#2563eb', wordBreak: 'break-word' }}>
                                {item.shortUrl}
                            </td>

                            <td
                                style={{
                                    padding: '14px 8px',
                                    color: '#4b5563',
                                    maxWidth: 320,
                                    wordBreak: 'break-word',
                                }}
                            >
                                {item.longUrl}
                            </td>

                            <td style={{ padding: '14px 8px' }}>
                                <StatusBadge status={item.status} />
                            </td>

                            <td style={{ padding: '14px 8px', color: '#111827' }}>{item.clicks}</td>

                            <td style={{ padding: '14px 8px', color: '#6b7280' }}>{item.createdAt}</td>

                            <td style={{ padding: '14px 8px', color: '#6b7280' }}>
                                {item.expiresAt || '—'}
                            </td>

                            <td style={{ padding: '14px 8px' }}>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(item.shortUrl, item.alias)}
                                        style={{
                                            padding: '8px 10px',
                                            borderRadius: 8,
                                            border: '1px solid #d1d5db',
                                            background: '#ffffff',
                                            color: '#111827',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {copiedAlias === item.alias ? 'Copied' : 'Copy'}
                                    </button>

                                    <Link
                                        to={`/app/links/${item.alias}`}
                                        style={{
                                            textDecoration: 'none',
                                            padding: '8px 10px',
                                            borderRadius: 8,
                                            background: '#111827',
                                            color: '#ffffff',
                                            fontWeight: 600,
                                        }}
                                    >
                                        View
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    ))}

                    {filteredLinks.length === 0 && (
                        <tr>
                            <td colSpan={8} style={{ padding: '28px 8px', textAlign: 'center' }}>
                                <div style={{ color: '#6b7280' }}>No links match the current filters.</div>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </section>

            <section
                style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 16,
                    padding: 20,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
                }}
            >
                <h3 style={{ marginTop: 0, color: '#111827' }}>Notes</h3>
                <ul
                    style={{
                        margin: 0,
                        paddingLeft: 18,
                        color: '#6b7280',
                        lineHeight: 1.7,
                        fontSize: 14,
                    }}
                >
                    <li>This is a frontend management view backed by placeholder data for now.</li>
                    <li>Later, this page should use management APIs plus cursor-based pagination.</li>
                    <li>The redirect hot path should not depend on this page or the React app.</li>
                </ul>
            </section>
        </div>
    );
}
