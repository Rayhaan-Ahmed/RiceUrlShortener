package edu.rice.atlink.backend.service;

import edu.rice.atlink.backend.config.AuthProperties;
import edu.rice.atlink.backend.model.UserRecord;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final AuthProperties properties;
    private final SecretKey signingKey;

    public JwtService(AuthProperties properties) {
        this.properties = properties;
        this.signingKey = Keys.hmacShaKeyFor(normalizeSecret(properties.jwtSecret()).getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(UserRecord user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(properties.jwtExpirationSeconds());

        return Jwts.builder()
                .subject(user.username())
                .claim("email", user.email())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(signingKey)
                .compact();
    }

    public String validateAndGetUsername(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }

    private String normalizeSecret(String rawSecret) {
        if (rawSecret == null || rawSecret.length() < 32) {
            throw new IllegalStateException("JWT_SECRET must be at least 32 characters");
        }
        return rawSecret;
    }
}
