import type {
    LinkItem,
    CreateLinkRequest,
    UpdateLinkRequest,
    GetLinksParams,
    DashboardMetrics,
} from '../types/link';

const LINKS_KEY = 'atlink_links';

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const seedLinks: LinkItem[] = [
    {
        alias: 'spring-launch',
        shortUrl: 'https://at.link/spring-launch',
        longUrl: 'https://example.com/campaigns/spring-launch',
        status: 'Active',
        clicks: 1248,
        createdAt: '2026-03-22',
        expiresAt: '2026-06-01 23:59',
        owner: 'demo-user',
        metadata: '{"campaign":"spring-launch"}',
        todayClicks: 42,
        last7DaysClicks: 318,
        topReferrers: [
            { source: 'Google', clicks: 420 },
            { source: 'Twitter', clicks: 286 },
            { source: 'Direct', clicks: 224 },
        ],
        notes: 'Primary launch campaign link for the spring release.',
    },
    {
        alias: 'cs-course-notes',
        shortUrl: 'https://at.link/cs-course-notes',
        longUrl: 'https://example.com/resources/comp-539-notes',
        status: 'Active',
        clicks: 392,
        createdAt: '2026-03-19',
        owner: 'demo-user',
        todayClicks: 11,
        last7DaysClicks: 95,
        topReferrers: [
            { source: 'Canvas', clicks: 142 },
            { source: 'Direct', clicks: 101 },
            { source: 'Slack', clicks: 74 },
        ],
        notes: 'Shared course materials and notes link.',
    },
    {
        alias: 'old-promo-2025',
        shortUrl: 'https://at.link/old-promo-2025',
        longUrl: 'https://example.com/archive/old-promo',
        status: 'Expired',
        clicks: 86,
        createdAt: '2026-02-28',
        expiresAt: '2026-03-10 00:00',
        owner: 'demo-user',
        todayClicks: 0,
        last7DaysClicks: 0,
        topReferrers: [
            { source: 'Email', clicks: 31 },
            { source: 'Direct', clicks: 21 },
            { source: 'Facebook', clicks: 14 },
        ],
        notes: 'Archived promotional link; no longer active.',
    },
    {
        alias: 'team-demo',
        shortUrl: 'https://at.link/team-demo',
        longUrl: 'https://example.com/demo/system-design',
        status: 'Active',
        clicks: 731,
        createdAt: '2026-03-20',
        owner: 'demo-user',
        todayClicks: 27,
        last7DaysClicks: 204,
        topReferrers: [
            { source: 'Direct', clicks: 298 },
            { source: 'Notion', clicks: 123 },
            { source: 'Slack', clicks: 96 },
        ],
        notes: 'Demo link used for project presentations.',
    },
    {
        alias: 'internal-preview',
        shortUrl: 'https://at.link/internal-preview',
        longUrl: 'https://example.com/internal/preview-build',
        status: 'Disabled',
        clicks: 51,
        createdAt: '2026-03-14',
        owner: 'demo-user',
        todayClicks: 1,
        last7DaysClicks: 6,
        topReferrers: [
            { source: 'Direct', clicks: 23 },
            { source: 'Slack', clicks: 11 },
            { source: 'Docs', clicks: 7 },
        ],
        notes: 'Temporarily disabled internal preview link.',
    },
    {
        alias: 'launch-deck',
        shortUrl: 'https://at.link/launch-deck',
        longUrl: 'https://example.com/slides/launch-deck-v3',
        status: 'Active',
        clicks: 915,
        createdAt: '2026-03-23',
        owner: 'demo-user',
        todayClicks: 64,
        last7DaysClicks: 264,
        topReferrers: [
            { source: 'Email', clicks: 272 },
            { source: 'Direct', clicks: 188 },
            { source: 'LinkedIn', clicks: 97 },
        ],
        notes: 'Launch presentation deck shared externally.',
    },
];

function getStoredLinks(): LinkItem[] {
    const raw = localStorage.getItem(LINKS_KEY);
    if (!raw) {
        localStorage.setItem(LINKS_KEY, JSON.stringify(seedLinks));
        return [...seedLinks];
    }
    return JSON.parse(raw);
}

function saveLinks(links: LinkItem[]): void {
    localStorage.setItem(LINKS_KEY, JSON.stringify(links));
}

function generateAlias(longUrl: string): string {
    try {
        const parsed = new URL(longUrl);
        const raw = parsed.hostname.replace(/^www\./, '').split('.')[0] || 'link';
        return `${raw}-${Math.random().toString(36).slice(2, 7)}`;
    } catch {
        return `link-${Math.random().toString(36).slice(2, 7)}`;
    }
}

function formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

// --- API Functions ---

export async function createLink(data: CreateLinkRequest): Promise<LinkItem> {
    await delay(500);

    if (!data.longUrl.trim()) {
        throw new Error('Long URL is required');
    }

    try {
        new URL(data.longUrl);
    } catch {
        throw new Error('Please enter a valid URL, including http:// or https://');
    }

    const links = getStoredLinks();
    const alias = data.customAlias?.trim() || generateAlias(data.longUrl);

    if (links.some((l) => l.alias === alias)) {
        throw new Error(`Alias "${alias}" is already taken`);
    }

    const newLink: LinkItem = {
        alias,
        shortUrl: `https://at.link/${alias}`,
        longUrl: data.longUrl.trim(),
        status: 'Active',
        clicks: 0,
        createdAt: formatDate(new Date()),
        expiresAt: data.expiresAt || undefined,
        owner: 'current-user',
        metadata: data.metadata || undefined,
        todayClicks: 0,
        last7DaysClicks: 0,
        topReferrers: [],
        notes: undefined,
    };

    links.unshift(newLink);
    saveLinks(links);

    return newLink;
}

export async function getLinks(params?: GetLinksParams): Promise<LinkItem[]> {
    await delay(300);

    let links = getStoredLinks();

    if (params?.status) {
        links = links.filter((l) => l.status === params.status);
    }

    if (params?.search) {
        const q = params.search.toLowerCase();
        links = links.filter(
            (l) =>
                l.alias.toLowerCase().includes(q) ||
                l.shortUrl.toLowerCase().includes(q) ||
                l.longUrl.toLowerCase().includes(q),
        );
    }

    return links;
}

export async function getLinkDetail(alias: string): Promise<LinkItem> {
    await delay(300);

    const links = getStoredLinks();
    const found = links.find((l) => l.alias === alias);

    if (!found) {
        throw new Error(`Link with alias "${alias}" not found`);
    }

    return found;
}

export async function updateLink(alias: string, data: UpdateLinkRequest): Promise<LinkItem> {
    await delay(500);

    const links = getStoredLinks();
    const index = links.findIndex((l) => l.alias === alias);

    if (index === -1) {
        throw new Error(`Link with alias "${alias}" not found`);
    }

    if (data.longUrl !== undefined) {
        if (!data.longUrl.trim()) throw new Error('Long URL cannot be empty');
        try {
            new URL(data.longUrl);
        } catch {
            throw new Error('Please enter a valid URL');
        }
        links[index].longUrl = data.longUrl.trim();
    }

    if (data.expiresAt !== undefined) links[index].expiresAt = data.expiresAt || undefined;
    if (data.metadata !== undefined) links[index].metadata = data.metadata || undefined;
    if (data.status !== undefined) links[index].status = data.status;
    if (data.notes !== undefined) links[index].notes = data.notes || undefined;

    saveLinks(links);
    return links[index];
}

export async function deleteLink(alias: string): Promise<void> {
    await delay(300);

    const links = getStoredLinks();
    const index = links.findIndex((l) => l.alias === alias);

    if (index === -1) {
        throw new Error(`Link with alias "${alias}" not found`);
    }

    links.splice(index, 1);
    saveLinks(links);
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
    await delay(300);

    const links = getStoredLinks();

    return {
        totalLinks: links.length,
        activeLinks: links.filter((l) => l.status === 'Active').length,
        totalClicks: links.reduce((sum, l) => sum + l.clicks, 0),
        expiredLinks: links.filter((l) => l.status === 'Expired').length,
    };
}
