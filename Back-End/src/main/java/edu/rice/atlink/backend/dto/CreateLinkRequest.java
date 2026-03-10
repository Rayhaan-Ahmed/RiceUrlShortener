package edu.rice.atlink.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateLinkRequest(
        @NotBlank(message = "longUrl is required")
        @Pattern(regexp = "https?://.+", message = "longUrl must start with http:// or https://")
        String longUrl,
        @Size(min = 4, max = 32, message = "customAlias must be between 4 and 32 characters")
        @Pattern(regexp = "^[A-Za-z0-9_-]*$", message = "customAlias may contain only letters, numbers, underscore, and hyphen")
        String customAlias,
        @Size(max = 64, message = "creatorId must be at most 64 characters")
        String creatorId,
        String expiresAt
) {
}
