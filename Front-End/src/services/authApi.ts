import type { LoginRequest, SignupRequest, UpdateProfileRequest, AuthResponse, User } from '../types/auth';

type BackendAuthResponse = {
    username: string;
    email: string;
    token: string;
};

type ApiErrorPayload = {
    message?: string;
    error?: string;
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
            const payload = (await response.json()) as ApiErrorPayload;
            message = payload.message || payload.error || message;
        } catch {
            // Keep the status-based fallback for non-JSON responses.
        }

        throw new Error(message);
    }

    return (await response.json()) as T;
}

function toAuthResponse(response: BackendAuthResponse): AuthResponse {
    return {
        token: response.token,
        user: {
            id: response.username,
            name: response.username,
            email: response.email,
        },
    };
}

export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
    if (!data.email || !data.password) {
        throw new Error('Username and password are required');
    }

    const response = await request<BackendAuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            username: data.email.trim(),
            password: data.password,
        }),
    });

    return toAuthResponse(response);
}

export async function signupApi(data: SignupRequest): Promise<AuthResponse> {
    if (!data.email || !data.password || !data.name) {
        throw new Error('Username, email, and password are required');
    }

    if (data.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
    }

    const response = await request<BackendAuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            username: data.name.trim(),
            email: data.email.trim(),
            password: data.password,
        }),
    });

    return toAuthResponse(response);
}

export async function checkNameExists(_name: string, _currentUserId: string): Promise<boolean> {
    return false;
}

export async function checkEmailExists(_email: string, _currentUserId: string): Promise<boolean> {
    return false;
}

export async function updateProfileApi(
    userId: string,
    data: UpdateProfileRequest,
): Promise<User> {
    return {
        id: data.name ?? userId,
        name: data.name ?? userId,
        email: data.email ?? '',
    };
}

export async function logoutApi(): Promise<void> {
}
