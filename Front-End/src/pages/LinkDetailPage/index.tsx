import { Link, useParams } from 'react-router-dom';

type LinkStatus = 'Active' | 'Expired' | 'Disabled';

type LinkDetail = {
    alias: string;
    shortUrl: string;
    longUrl: string;
    status: LinkStatus;
    createdAt: string;
    expiresAt?: string;
    owner: string;
    totalClicks: number;
    todayClicks: number;
    last7DaysClicks: number;
    topReferrers: { source: string; clicks: number }[];
    notes?: string;
};

const mockLinkDetails: Record<string, LinkDetail> = {
    'spring-launch': {
        alias: 'spring-launch',
        shortUrl: 'https://at.link/spring-launch',
        longUrl: 'https://example.com/campaigns/spring-launch',
        status: 'Active',
        createdAt: '2026-03-22 10:15',
        expiresAt: '2026-06-01 23:59',
        owner: 'demo-user',
        totalClicks: 1248,
        todayClicks: 42,
        last7DaysClicks: 318,
        topReferrers: [
            { source: 'Google', clicks: 420 },
            { source: 'Twitter', clicks: 286 },
            { source: 'Direct', clicks: 224 },
        ],
        notes: 'Primary launch campaign link for the spring release.',
    },
    'cs-course-notes': {
        alias: 'cs-course-notes',
        shortUrl: 'https://at.link/cs-course-notes',
        longUrl: 'https://example.com/resources/comp-539-notes',
        status: 'Active',
        createdAt: '2026-03-19 14:20',
        owner: 'demo-user',
        totalClicks: 392,
        todayClicks: 11,
        last7DaysClicks: 95,
        topReferrers: [
            { source: 'Canvas', clicks: 142 },
            { source: 'Direct', clicks: 101 },
            { source: 'Slack', clicks: 74 },
        ],
        notes: 'Shared course materials and notes link.',
    },
    'old-promo-2025': {
        alias: 'old-promo-2025',
        shortUrl: 'https://at.link/old-promo-2025',
        longUrl: 'https://example.com/archive/old-promo',
        status: 'Expired',
        createdAt: '2026-02-28 08:05',
        expiresAt: '2026-03-10 00:00',
        owner: 'demo-user',
        totalClicks: 86,
        todayClicks: 0,
        last7DaysClicks: 0,
        topReferrers: [
            { source: 'Email', clicks: 31 },
            { source: 'Direct', clicks: 21 },
            { source: 'Facebook', clicks: 14 },
        ],
        notes: 'Archived promotional link; no longer active.',
    },
    'team-demo': {
        alias: 'team-demo',
        shortUrl: 'https://at.link/team-demo',
        longUrl: 'https://example.com/demo/system-design',
        status: 'Active',
        createdAt: '2026-03-20 18:40',
        owner: 'demo-user',
        totalClicks: 731,
        todayClicks: 27,
        last7DaysClicks: 204,
        topReferrers: [
            { source: 'Direct', clicks: 298 },
            { source: 'Notion', clicks: 123 },
            { source: 'Slack', clicks: 96 },
        ],
        notes: 'Demo link used for project presentations.',
    },
    'internal-preview': {
        alias: 'internal-preview',
        shortUrl: 'https://at.link/internal-preview',
        longUrl: 'https://example.com/internal/preview-build',
        status: 'Disabled',
        createdAt: '2026-03-14 12:10',
        owner: 'demo-user',
        totalClicks: 51,
        todayClicks: 1,
        last7DaysClicks: 6,
        topReferrers: [
            { source: 'Direct', clicks: 23 },
            { source: 'Slack', clicks: 11 },
            { source: 'Docs', clicks: 7 },
        ],
        notes: 'Temporarily disabled internal preview link.',
    },
    'launch-deck': {
        alias: 'launch-deck',
        shortUrl: 'https://at.link/launch-deck',
        longUrl: 'https://example.com/slides/launch-deck-v3',
        status: 'Active',
        createdAt: '2026-03-23 09:00',
        owner: 'demo-user',
        totalClicks: 915,
        todayClicks: 64,
        last7DaysClicks: 264,
        topReferrers: [
            { source: 'Email', clicks: 272 },
            { source: 'Direct', clicks: 188 },
            { source: 'LinkedIn', clicks: 97 },
        ],
        notes: 'Launch presentation deck shared externally.',
    },
};

function StatusBadge({ status }: { status: LinkStatus }) {
    const styles: Record<LinkStatus, React.CSSProperties> = {
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
                ...styles[status],
            }}
        >
      {status}
    </span>
    );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr',
                gap: 12,
                padding: '12px 0',
                borderBottom: '1px solid #f3f4f6',
            }}
        >
            <div style={{ color: '#6b7280', fontSize: 14, fontWeight: 600 }}>{label}</div>
            <div style={{ color: '#111827', fontSize: 14, wordBreak: 'break-word' }}>{value}</div>
        </div>
    );
}

function MetricCard({
                        title,
                        value,
                        hint,
                    }: {
    title: string;
    value: string;
    hint: string;
}) {
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
            <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>{title}</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                {value}
            </div>
            <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5 }}>{hint}</div>
        </div>
    );
}

export default function LinkDetailPage() {
    const { alias } = useParams<{ alias: string }>();

    const link = alias ? mockLinkDetails[alias] : undefined;

    if (!link) {
        return (
            <div
                style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 20,
                    padding: 28,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
                }}
            >
                <h2 style={{ marginTop: 0, color: '#111827' }}>Link Not Found</h2>
                <p style={{ color: '#6b7280', lineHeight: 1.7 }}>
                    The alias you requested does not exist in the current mock dataset.
                </p>
                <Link
                    to="/app/links"
                    style={{
                        display: 'inline-block',
                        marginTop: 12,
                        textDecoration: 'none',
                        background: '#111827',
                        color: '#ffffff',
                        padding: '12px 16px',
                        borderRadius: 10,
                        fontWeight: 600,
                    }}
                >
                    Back to Links
                </Link>
            </div>
        );
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
                            LINK DETAIL
                        </div>
                        <h2 style={{ margin: 0, fontSize: 30, color: '#111827' }}>{link.alias}</h2>
                        <p
                            style={{
                                margin: '12px 0 0',
                                maxWidth: 760,
                                color: '#6b7280',
                                lineHeight: 1.7,
                                fontSize: 15,
                            }}
                        >
                            Inspect the current management-plane view of this link, including status,
                            lifecycle metadata, and aggregated analytics.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <StatusBadge status={link.status} />

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
                            Back to Links
                        </Link>
                    </div>
                </div>
            </section>

            <section
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: 16,
                }}
            >
                <MetricCard
                    title="Total Clicks"
                    value={String(link.totalClicks)}
                    hint="Aggregated clicks for this short link"
                />
                <MetricCard
                    title="Today"
                    value={String(link.todayClicks)}
                    hint="Clicks recorded during the current day"
                />
                <MetricCard
                    title="Last 7 Days"
                    value={String(link.last7DaysClicks)}
                    hint="Recent activity summary"
                />
            </section>

            <section
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1.6fr 1fr',
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
                    }}
                >
                    <h3 style={{ marginTop: 0, color: '#111827' }}>Basic Information</h3>

                    <InfoRow label="Alias" value={link.alias} />
                    <InfoRow label="Short URL" value={link.shortUrl} />
                    <InfoRow label="Long URL" value={link.longUrl} />
                    <InfoRow label="Owner" value={link.owner} />
                    <InfoRow label="Status" value={<StatusBadge status={link.status} />} />
                    <InfoRow label="Created At" value={link.createdAt} />
                    <InfoRow label="Expires At" value={link.expiresAt || 'No expiration'} />
                    <InfoRow label="Notes" value={link.notes || '—'} />
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
                        <h3 style={{ marginTop: 0, color: '#111827' }}>Top Referrers</h3>

                        <div style={{ display: 'grid', gap: 12 }}>
                            {link.topReferrers.map((item) => (
                                <div
                                    key={item.source}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        gap: 12,
                                        padding: '12px 0',
                                        borderBottom: '1px solid #f3f4f6',
                                    }}
                                >
                                    <div style={{ color: '#111827', fontWeight: 600 }}>{item.source}</div>
                                    <div style={{ color: '#6b7280' }}>{item.clicks} clicks</div>
                                </div>
                            ))}
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
                        <h3 style={{ marginTop: 0, color: '#111827' }}>Management Notes</h3>
                        <ul
                            style={{
                                margin: 0,
                                paddingLeft: 18,
                                color: '#6b7280',
                                lineHeight: 1.7,
                                fontSize: 14,
                            }}
                        >
                            <li>This detail page is using mock data for now.</li>
                            <li>Later it should call the management API by alias.</li>
                            <li>Analytics shown here are aggregated summaries only.</li>
                            <li>The redirect path should remain independent from this page.</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
}