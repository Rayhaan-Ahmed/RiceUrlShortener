package edu.rice.atlink.backend.repository;

import edu.rice.atlink.backend.model.UserRecord;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
@ConditionalOnProperty(name = "app.storage.type", havingValue = "memory")
public class InMemoryUserRepository implements UserRepository {

    private final ConcurrentHashMap<String, UserRecord> usersByUsername = new ConcurrentHashMap<>();

    @Override
    public Optional<UserRecord> findByUsername(String username) {
        return Optional.ofNullable(usersByUsername.get(username));
    }

    @Override
    public boolean saveIfAbsent(UserRecord record) {
        return usersByUsername.putIfAbsent(record.username(), record) == null;
    }
}
