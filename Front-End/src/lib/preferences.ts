const CREATOR_ID_KEY = 'atlink.creatorId';

export function getStoredCreatorId(): string {
    return window.localStorage.getItem(CREATOR_ID_KEY)?.trim() ?? '';
}

export function setStoredCreatorId(creatorId: string): void {
    const normalized = creatorId.trim();
    if (normalized) {
        window.localStorage.setItem(CREATOR_ID_KEY, normalized);
        return;
    }

    window.localStorage.removeItem(CREATOR_ID_KEY);
}
