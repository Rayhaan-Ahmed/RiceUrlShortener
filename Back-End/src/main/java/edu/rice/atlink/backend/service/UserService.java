package edu.rice.atlink.backend.service;

import edu.rice.atlink.backend.dto.AuthRequests.LoginRequest;
import edu.rice.atlink.backend.dto.AuthRequests.RegisterRequest;
import edu.rice.atlink.backend.dto.AuthResponse;
import edu.rice.atlink.backend.model.UserRecord;
import edu.rice.atlink.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.Instant;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public AuthResponse registerUser(RegisterRequest request) {
        String hashedPassword = passwordEncoder.encode(request.password());

        UserRecord newUser = new UserRecord(
                request.username(),
                request.email(),
                hashedPassword,
                Instant.now()
        );

        boolean created = userRepository.saveIfAbsent(newUser);
        if (!created) {
            throw new IllegalArgumentException("Username already exists");
        }

        String token = generateToken(newUser);
        return new AuthResponse(newUser.username(), newUser.email(), token);
    }

    public AuthResponse loginUser(LoginRequest request) {
        UserRecord user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!passwordEncoder.matches(request.password(), user.passwordHash())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        String token = generateToken(user);
        return new AuthResponse(user.username(), user.email(), token);
    }

    private String generateToken(UserRecord user) {
        return UUID.randomUUID().toString() + "-placeholder-token";
    }
}
