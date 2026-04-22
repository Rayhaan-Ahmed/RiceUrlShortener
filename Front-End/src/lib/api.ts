export type LinkResponse = {
    alias: string;
    shortUrl: string;
    longUrl: string;
    creatorId: string | null;
    createdAt: string;
    expiresAt: string | null;
    clickCount: number;
};

export type LinkListResponse = {
    items: LinkResponse[];
    nextCursor: string | null;
};

export type CreateLinkPayload = {
    longUrl: string;
    customAlias?: string;
    creatorId?: string;
    expiresAt?: string;
};

type ApiErrorPayload = {
    message?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);
    if (init?.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers,
        ...init,
    });

    if (!response.ok) {
        let message = `Request failed with status ${response.status}`;

        try {
            const errorPayload = (await response.json()) as ApiErrorPayload;
            if (errorPayload.message) {
                message = errorPayload.message;
            }
        } catch {
            // Ignore non-JSON error responses and keep the fallback message.
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}

export async function createLink(payload: CreateLinkPayload): Promise<LinkResponse> {
    return request<LinkResponse>('/api/links', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function getLink(alias: string): Promise<LinkResponse> {
    return request<LinkResponse>(`/api/links/${encodeURIComponent(alias)}`);
}

export async function listLinks(creatorId: string, cursor?: string | null, limit = 20): Promise<LinkListResponse> {
    const params = new URLSearchParams({ creatorId, limit: String(limit) });
    if (cursor) {
        params.set('cursor', cursor);
    }
    return request<LinkListResponse>(`/api/links?${params.toString()}`);
}
