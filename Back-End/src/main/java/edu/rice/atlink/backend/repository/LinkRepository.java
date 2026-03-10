package edu.rice.atlink.backend.repository;

import edu.rice.atlink.backend.model.LinkRecord;

import java.util.Optional;

public interface LinkRepository {

    Optional<LinkRecord> findByAlias(String alias);

    LinkPage findPageByCreatorId(String creatorId, String cursor, int limit);

    boolean saveIfAbsent(LinkRecord record);

    void save(LinkRecord record);
}
