package edu.rice.atlink.backend.repository;

import com.google.api.gax.rpc.ServerStream;
import com.google.cloud.bigtable.data.v2.BigtableDataClient;
import com.google.cloud.bigtable.data.v2.models.ConditionalRowMutation;
import com.google.cloud.bigtable.data.v2.models.Filters;
import com.google.cloud.bigtable.data.v2.models.Mutation;
import com.google.cloud.bigtable.data.v2.models.Query;
import com.google.cloud.bigtable.data.v2.models.Row;
import com.google.cloud.bigtable.data.v2.models.RowCell;
import com.google.cloud.bigtable.data.v2.models.RowMutation;
import edu.rice.atlink.backend.config.BigtableProperties;
import edu.rice.atlink.backend.model.LinkRecord;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@ConditionalOnProperty(name = "app.storage.type", havingValue = "bigtable")
public class BigtableLinkRepository implements LinkRepository {

    private static final String URL_FAMILY = "urlmapping";
    private static final String CREATOR_FAMILY = "creator-info";
    private static final String ANALYTICS_FAMILY = "analytics";

    private final BigtableDataClient bigtableDataClient;
    private final BigtableProperties properties;

    public BigtableLinkRepository(BigtableDataClient bigtableDataClient, BigtableProperties properties) {
        this.bigtableDataClient = bigtableDataClient;
        this.properties = properties;
    }

    @Override
    public Optional<LinkRecord> findByAlias(String alias) {
        Row row = bigtableDataClient.readRow(properties.linkTable(), alias);
        return Optional.ofNullable(row).map(this::toLinkRecord);
    }

    @Override
    public LinkPage findPageByCreatorId(String creatorId, String cursor, int limit) {
        String prefix = creatorId + "#";
        Query query = Query.create(properties.creatorIndexTable()).prefix(prefix);
        String decodedCursor = StringUtils.hasText(cursor) ? decodeCursor(cursor) : null;

        ServerStream<Row> rows = bigtableDataClient.readRows(query.limit(limit + 1));
        List<Row> indexRows = new ArrayList<>();
        for (Row row : rows) {
            String rowKey = row.getKey().toStringUtf8();
            if (decodedCursor != null && rowKey.compareTo(decodedCursor) <= 0) {
                continue;
            }
            indexRows.add(row);
            if (indexRows.size() == limit + 1) {
                break;
            }
        }

        List<Row> pageRows = indexRows.size() > limit ? indexRows.subList(0, limit) : indexRows;
        List<LinkRecord> items = pageRows.stream()
                .map(this::extractAliasFromIndexRow)
                .map(this::findByAlias)
                .flatMap(Optional::stream)
                .toList();

        String nextCursor = indexRows.size() > limit
                ? encodeCursor(indexRows.get(limit - 1).getKey().toStringUtf8())
                : null;

        return new LinkPage(items, nextCursor);
    }

    @Override
    public boolean saveIfAbsent(LinkRecord record) {
        Mutation mutation = Mutation.create()
                .setCell(URL_FAMILY, "longUrl", record.longUrl())
                .setCell(URL_FAMILY, "createdAt", record.createdAt().toString())
                .setCell(ANALYTICS_FAMILY, "clickCount", Long.toString(record.clickCount()));

        if (record.expiresAt() != null) {
            mutation.setCell(URL_FAMILY, "expiresAt", record.expiresAt().toString());
        }
        if (record.creatorId() != null) {
            mutation.setCell(CREATOR_FAMILY, "creatorId", record.creatorId());
        }

        boolean created = bigtableDataClient.checkAndMutateRow(
                ConditionalRowMutation.create(properties.linkTable(), record.alias())
                        .condition(Filters.FILTERS.limit().cellsPerRow(1))
                        .otherwise(mutation)
        );

        if (created && record.creatorId() != null) {
            bigtableDataClient.mutateRow(buildCreatorIndexMutation(record));
        }
        return created;
    }

    @Override
    public void save(LinkRecord record) {
        RowMutation mutation = RowMutation.create(properties.linkTable(), record.alias())
                .setCell(URL_FAMILY, "longUrl", record.longUrl())
                .setCell(URL_FAMILY, "createdAt", record.createdAt().toString())
                .setCell(ANALYTICS_FAMILY, "clickCount", Long.toString(record.clickCount()));

        if (record.expiresAt() != null) {
            mutation.setCell(URL_FAMILY, "expiresAt", record.expiresAt().toString());
        }
        if (record.creatorId() != null) {
            mutation.setCell(CREATOR_FAMILY, "creatorId", record.creatorId());
            bigtableDataClient.mutateRow(buildCreatorIndexMutation(record));
        }

        bigtableDataClient.mutateRow(mutation);
    }

    private RowMutation buildCreatorIndexMutation(LinkRecord record) {
        return RowMutation.create(properties.creatorIndexTable(), creatorIndexKey(record))
                .setCell(CREATOR_FAMILY, "alias", record.alias())
                .setCell(CREATOR_FAMILY, "createdAt", record.createdAt().toString());
    }

    private LinkRecord toLinkRecord(Row row) {
        Map<String, String> values = row.getCells().stream()
                .collect(Collectors.toMap(
                        cell -> cell.getFamily() + ":" + cell.getQualifier().toStringUtf8(),
                        cell -> cell.getValue().toStringUtf8(),
                        (first, second) -> first
                ));

        String alias = row.getKey().toStringUtf8();
        String longUrl = values.get(URL_FAMILY + ":longUrl");
        String creatorId = values.get(CREATOR_FAMILY + ":creatorId");
        Instant createdAt = Instant.parse(values.get(URL_FAMILY + ":createdAt"));
        String expiresAtRaw = values.get(URL_FAMILY + ":expiresAt");
        Instant expiresAt = expiresAtRaw == null ? null : Instant.parse(expiresAtRaw);
        long clickCount = Long.parseLong(values.getOrDefault(ANALYTICS_FAMILY + ":clickCount", "0"));

        return new LinkRecord(alias, longUrl, creatorId, createdAt, expiresAt, clickCount);
    }

    private String extractAliasFromIndexRow(Row row) {
        Optional<RowCell> aliasCell = row.getCells(CREATOR_FAMILY, "alias").stream().findFirst();
        return aliasCell.map(cell -> cell.getValue().toStringUtf8()).orElseThrow();
    }

    private String creatorIndexKey(LinkRecord record) {
        long reverseTimestamp = Long.MAX_VALUE - record.createdAt().toEpochMilli();
        return record.creatorId() + "#" + reverseTimestamp + "#" + record.alias();
    }

    private String decodeCursor(String cursor) {
        return new String(Base64.getUrlDecoder().decode(cursor), StandardCharsets.UTF_8);
    }

    private String encodeCursor(String rowKey) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(rowKey.getBytes(StandardCharsets.UTF_8));
    }

}
