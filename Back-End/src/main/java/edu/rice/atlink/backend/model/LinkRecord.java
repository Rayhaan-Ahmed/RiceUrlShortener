package edu.rice.atlink.backend.model;

import java.time.Instant;

public record LinkRecord(
        String alias,
        String longUrl,
        String creatorId,
        Instant createdAt,
        Instant expiresAt,
        long clickCount
) {

    public boolean isExpired(Instant now) {
        return expiresAt != null && expiresAt.isBefore(now);
    }

    public LinkRecord incrementClicks() {
        return new LinkRecord(alias, longUrl, creatorId, createdAt, expiresAt, clickCount + 1);
    }
}
