package edu.rice.atlink.backend.repository;

import edu.rice.atlink.backend.model.LinkRecord;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
@Primary
@ConditionalOnProperty(name = "app.storage.type", havingValue = "memory", matchIfMissing = true)
public class InMemoryLinkRepository implements LinkRepository {

    private final ConcurrentHashMap<String, LinkRecord> linksByAlias = new ConcurrentHashMap<>();

    @Override
    public Optional<LinkRecord> findByAlias(String alias) {
        return Optional.ofNullable(linksByAlias.get(alias));
    }

    @Override
    public LinkPage findPageByCreatorId(String creatorId, String cursor, int limit) {
        List<LinkRecord> records = linksByAlias.values().stream()
                .filter(link -> creatorId.equals(link.creatorId()))
                .sorted(Comparator.comparing(LinkRecord::createdAt).reversed())
                .toList();

        int startIndex = 0;
        if (cursor != null && !cursor.isBlank()) {
            for (int i = 0; i < records.size(); i++) {
                if (records.get(i).alias().equals(cursor)) {
                    startIndex = i + 1;
                    break;
                }
            }
        }

        int toIndex = Math.min(startIndex + limit, records.size());
        List<LinkRecord> page = records.subList(startIndex, toIndex);
        String nextCursor = toIndex < records.size() ? records.get(toIndex - 1).alias() : null;
        return new LinkPage(page, nextCursor);
    }

    @Override
    public boolean saveIfAbsent(LinkRecord record) {
        return linksByAlias.putIfAbsent(record.alias(), record) == null;
    }

    @Override
    public void save(LinkRecord record) {
        linksByAlias.put(record.alias(), record);
    }
}
