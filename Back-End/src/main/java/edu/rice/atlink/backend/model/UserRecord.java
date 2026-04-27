package edu.rice.atlink.backend.model;

import java.time.Instant;

public record UserRecord(
        String username,
        String email,
        String passwordHash,
        Instant createdAt
) {
}