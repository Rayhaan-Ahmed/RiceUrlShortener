package edu.rice.atlink.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.bigtable")
public record BigtableProperties(
        String projectId,
        String instanceId,
        String linkTable,
        String creatorIndexTable,
        String emulatorHost,
        Integer emulatorPort
) {
}
