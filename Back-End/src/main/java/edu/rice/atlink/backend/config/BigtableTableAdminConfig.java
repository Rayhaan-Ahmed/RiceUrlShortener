package edu.rice.atlink.backend.config;

import com.google.cloud.bigtable.admin.v2.BigtableTableAdminClient;
import com.google.cloud.bigtable.admin.v2.BigtableTableAdminSettings;
import com.google.cloud.bigtable.admin.v2.models.CreateTableRequest;
import com.google.cloud.bigtable.admin.v2.models.ModifyColumnFamiliesRequest;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Configuration
@ConditionalOnProperty(name = "app.storage.type", havingValue = "bigtable")
public class BigtableTableAdminConfig {

    @Bean(destroyMethod = "close")
    public BigtableTableAdminClient bigtableTableAdminClient(BigtableProperties properties) throws IOException {
        BigtableTableAdminSettings settings;
        if (StringUtils.hasText(properties.emulatorHost()) && properties.emulatorPort() != null) {
            settings = BigtableTableAdminSettings.newBuilderForEmulator(properties.emulatorHost(), properties.emulatorPort())
                    .setProjectId(properties.projectId())
                    .setInstanceId(properties.instanceId())
                    .build();
        } else {
            settings = BigtableTableAdminSettings.newBuilder()
                    .setProjectId(properties.projectId())
                    .setInstanceId(properties.instanceId())
                    .build();
        }
        return BigtableTableAdminClient.create(settings);
    }

    @Bean
    @ConditionalOnProperty(name = "app.bigtable.initialize-tables", havingValue = "true")
    public ApplicationRunner bigtableTableInitializer(BigtableTableAdminClient adminClient, BigtableProperties properties) {
        return args -> {
            ensureTable(adminClient, properties.linkTable(), List.of("urlmapping", "creator-info", "analytics", "ttl"));
            ensureTable(adminClient, properties.creatorIndexTable(), List.of("creator-info"));
            ensureTable(adminClient, properties.userTable(), List.of("user", "email", "pass"));
        };
    }

    private void ensureTable(BigtableTableAdminClient adminClient, String tableName, List<String> families) {
        if (!adminClient.exists(tableName)) {
            CreateTableRequest request = CreateTableRequest.of(tableName);
            families.forEach(request::addFamily);
            adminClient.createTable(request);
            return;
        }

        Set<String> existingFamilies = adminClient.getTable(tableName).getColumnFamilies().stream()
                .map(com.google.cloud.bigtable.admin.v2.models.ColumnFamily::getId)
                .collect(Collectors.toSet());

        ModifyColumnFamiliesRequest request = ModifyColumnFamiliesRequest.of(tableName);
        boolean changed = false;
        for (String family : families) {
            if (!existingFamilies.contains(family)) {
                request.addFamily(family);
                changed = true;
            }
        }
        if (changed) {
            adminClient.modifyFamilies(request);
        }
    }
}
