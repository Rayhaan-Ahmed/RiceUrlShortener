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
    expiresAt?: string;
};

type ApiErrorPayload = {
    message?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';
const TOKEN_KEY = 'atlink_token';

function getAuthToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

async function request<T>(path: string, init?: RequestInit & { auth?: boolean }): Promise<T> {
    const { auth, ...requestInit } = init ?? {};
    const headers = new Headers(requestInit.headers);
    if (requestInit.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    if (auth) {
        const token = getAuthToken();
        if (!token) {
            throw new Error('You must be logged in to perform this action');
        }
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers,
        ...requestInit,
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
        auth: true,
    });
}

export async function getLink(alias: string): Promise<LinkResponse> {
    return request<LinkResponse>(`/api/links/${encodeURIComponent(alias)}`);
}

export async function listLinks(cursor?: string | null, limit = 20): Promise<LinkListResponse> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) {
        params.set('cursor', cursor);
    }
    return request<LinkListResponse>(`/api/links?${params.toString()}`, { auth: true });
}
