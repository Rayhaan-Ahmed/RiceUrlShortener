export interface User {
    id: string;
    email: string;
    name: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    email: string;
    password: string;
    name: string;
}

export interface UpdateProfileRequest {
    name?: string;
    email?: string;
    password?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}
