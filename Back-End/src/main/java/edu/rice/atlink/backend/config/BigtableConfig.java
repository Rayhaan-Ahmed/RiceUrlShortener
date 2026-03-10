package edu.rice.atlink.backend.config;

import com.google.cloud.bigtable.data.v2.BigtableDataClient;
import com.google.cloud.bigtable.data.v2.BigtableDataSettings;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import java.io.IOException;

@Configuration
@ConditionalOnProperty(name = "app.storage.type", havingValue = "bigtable")
public class BigtableConfig {

    @Bean(destroyMethod = "close")
    public BigtableDataClient bigtableDataClient(BigtableProperties properties) throws IOException {
        BigtableDataSettings settings;
        if (StringUtils.hasText(properties.emulatorHost()) && properties.emulatorPort() != null) {
            settings = BigtableDataSettings.newBuilderForEmulator(properties.emulatorHost(), properties.emulatorPort())
                    .setProjectId(properties.projectId())
                    .setInstanceId(properties.instanceId())
                    .build();
        } else {
            settings = BigtableDataSettings.newBuilder()
                    .setProjectId(properties.projectId())
                    .setInstanceId(properties.instanceId())
                    .build();
        }
        return BigtableDataClient.create(settings);
    }
}
