package edu.rice.atlink.backend.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthRequests {
    public record RegisterRequest(
        @NotBlank @Size(min = 3, max = 32) String username,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8) String password
) {}

public record LoginRequest(
        @NotBlank String username,
        @NotBlank String password
) {}
}
