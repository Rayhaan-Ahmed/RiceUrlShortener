package edu.rice.atlink.backend.service;

import java.util.Optional;

public interface LinkCacheService {

    Optional<String> getLongUrl(String alias);

    void putLongUrl(String alias, String longUrl);
}
