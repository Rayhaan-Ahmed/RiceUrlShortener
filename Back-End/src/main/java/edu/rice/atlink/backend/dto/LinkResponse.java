package edu.rice.atlink.backend.dto;

import java.time.Instant;

public record LinkResponse(
        String alias,
        String shortUrl,
        String longUrl,
        String creatorId,
        Instant createdAt,
        Instant expiresAt,
        long clickCount
) {
}
