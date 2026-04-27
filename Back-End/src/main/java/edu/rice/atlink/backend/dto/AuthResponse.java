package edu.rice.atlink.backend.dto;

public record AuthResponse(
    String username,
    String email,
    String token
) {}