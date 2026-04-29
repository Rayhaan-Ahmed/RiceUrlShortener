package edu.rice.atlink.backend.repository;

import edu.rice.atlink.backend.model.UserRecord;

import java.util.Optional;

public interface UserRepository {
    Optional<UserRecord> findByUsername(String username);

    boolean saveIfAbsent(UserRecord record);
}
