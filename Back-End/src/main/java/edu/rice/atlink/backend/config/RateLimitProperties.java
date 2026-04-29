package edu.rice.atlink.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.rate-limit")
public record RateLimitProperties(
        boolean enabled,
        long registerPerHour,
        long loginPerMinute,
        long createLinkPerMinute,
        long redirectPerMinute
) {
}
