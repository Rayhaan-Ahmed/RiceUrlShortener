import type { LoginRequest, SignupRequest, UpdateProfileRequest, AuthResponse, User } from '../types/auth';

const USERS_KEY = 'atlink_registered_users';

interface StoredUser {
    id: string;
    email: string;
    name: string;
    password: string;
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStoredUsers(): StoredUser[] {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
}

function saveStoredUsers(users: StoredUser[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
    await delay(500);

    if (!data.email || !data.password) {
        throw new Error('Email and password are required');
    }

    const users = getStoredUsers();
    const found = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());

    if (!found) {
        throw new Error('No account found with this email');
    }

    if (found.password !== data.password) {
        throw new Error('Incorrect password');
    }

    return {
        token: 'mock-jwt-' + Date.now(),
        user: {
            id: found.id,
            email: found.email,
            name: found.name,
        },
    };
}

export async function signupApi(data: SignupRequest): Promise<AuthResponse> {
    await delay(500);

    if (!data.email || !data.password || !data.name) {
        throw new Error('Name, email, and password are required');
    }

    if (data.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
    }

    const users = getStoredUsers();

    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
        throw new Error('An account with this email already exists');
    }

    if (users.some((u) => u.name.toLowerCase() === data.name.toLowerCase())) {
        throw new Error('This username is already taken');
    }

    const newUser: StoredUser = {
        id: 'user-' + Date.now(),
        email: data.email,
        name: data.name,
        password: data.password,
    };

    users.push(newUser);
    saveStoredUsers(users);

    return {
        token: 'mock-jwt-' + Date.now(),
        user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
        },
    };
}

export async function checkNameExists(name: string, currentUserId: string): Promise<boolean> {
    await delay(300);
    const users = getStoredUsers();
    return users.some(
        (u) => u.name.toLowerCase() === name.toLowerCase() && u.id !== currentUserId,
    );
}

export async function checkEmailExists(email: string, currentUserId: string): Promise<boolean> {
    await delay(300);
    const users = getStoredUsers();
    return users.some(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== currentUserId,
    );
}

export async function updateProfileApi(
    userId: string,
    data: UpdateProfileRequest,
): Promise<User> {
    await delay(500);

    if (data.name !== undefined && !data.name.trim()) {
        throw new Error('Name cannot be empty');
    }
    if (data.email !== undefined && !data.email.trim()) {
        throw new Error('Email cannot be empty');
    }
    if (data.password !== undefined && data.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
    }

    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === userId);

    if (index === -1) {
        throw new Error('User not found');
    }

    if (data.name !== undefined) users[index].name = data.name;
    if (data.email !== undefined) users[index].email = data.email;
    if (data.password !== undefined) users[index].password = data.password;

    saveStoredUsers(users);

    return {
        id: users[index].id,
        email: users[index].email,
        name: users[index].name,
    };
}

export async function logoutApi(): Promise<void> {
    // No-op for mock. Replace with real API call later.
}
