package edu.rice.atlink.backend.repository;

import com.google.cloud.bigtable.data.v2.BigtableDataClient;
import com.google.cloud.bigtable.data.v2.models.ConditionalRowMutation;
import com.google.cloud.bigtable.data.v2.models.Filters;
import com.google.cloud.bigtable.data.v2.models.Mutation;
import com.google.cloud.bigtable.data.v2.models.Row;
import edu.rice.atlink.backend.config.BigtableProperties;
import edu.rice.atlink.backend.model.UserRecord;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@ConditionalOnProperty(name = "app.storage.type", havingValue = "bigtable")
public class BigtableUserRepository implements UserRepository {

    private static final String USER_FAMILY = "user";
    private static final String EMAIL_FAMILY = "email";
    private static final String PASS_FAMILY = "pass";

    private final BigtableDataClient bigtableDataClient;
    private final BigtableProperties properties;

    public BigtableUserRepository(BigtableDataClient bigtableDataClient, BigtableProperties properties) {
        this.bigtableDataClient = bigtableDataClient;
        this.properties = properties;
    }

    @Override
    public Optional<UserRecord> findByUsername(String username) {
        Row row = bigtableDataClient.readRow(properties.userTable(), username);
        if (row == null) return Optional.empty();

        Map<String, String> values = row.getCells().stream()
                .collect(Collectors.toMap(
                        cell -> cell.getFamily() + ":" + cell.getQualifier().toStringUtf8(),
                        cell -> cell.getValue().toStringUtf8(),
                        (first, second) -> first
                ));

        return Optional.of(new UserRecord(
                username,
                values.get(EMAIL_FAMILY + ":address"),
                values.get(PASS_FAMILY + ":hash"),
                Instant.parse(values.getOrDefault(USER_FAMILY + ":createdAt", Instant.now().toString()))
        ));
    }

    @Override
    public boolean saveIfAbsent(UserRecord record) {
        Mutation mutation = Mutation.create()
                .setCell(USER_FAMILY, "username", record.username())
                .setCell(USER_FAMILY, "createdAt", record.createdAt().toString())
                .setCell(EMAIL_FAMILY, "address", record.email())
                .setCell(PASS_FAMILY, "hash", record.passwordHash());
        boolean rowExists = bigtableDataClient.checkAndMutateRow(
                ConditionalRowMutation.create(properties.userTable(), record.username())
                        .condition(Filters.FILTERS.limit().cellsPerRow(1))
                        .otherwise(mutation)
        );

        return !rowExists;
    }
}
