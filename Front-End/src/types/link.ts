export type LinkStatus = 'Active' | 'Expired' | 'Disabled';

export interface Referrer {
    source: string;
    clicks: number;
}

export interface LinkItem {
    alias: string;
    shortUrl: string;
    longUrl: string;
    status: LinkStatus;
    clicks: number;
    createdAt: string;
    expiresAt?: string;
    owner: string;
    metadata?: string;
    todayClicks: number;
    last7DaysClicks: number;
    topReferrers: Referrer[];
    notes?: string;
}

export interface CreateLinkRequest {
    longUrl: string;
    customAlias?: string;
    expiresAt?: string;
    metadata?: string;
}

export interface UpdateLinkRequest {
    longUrl?: string;
    expiresAt?: string;
    metadata?: string;
    status?: LinkStatus;
    notes?: string;
}

export interface GetLinksParams {
    search?: string;
    status?: LinkStatus;
}

export interface DashboardMetrics {
    totalLinks: number;
    activeLinks: number;
    totalClicks: number;
    expiredLinks: number;
}
