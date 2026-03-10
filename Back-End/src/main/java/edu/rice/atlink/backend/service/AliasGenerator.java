package edu.rice.atlink.backend.service;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class AliasGenerator {

    private static final String ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int DEFAULT_ALIAS_LENGTH = 7;

    private final SecureRandom secureRandom = new SecureRandom();

    public String generate() {
        StringBuilder alias = new StringBuilder(DEFAULT_ALIAS_LENGTH);
        for (int i = 0; i < DEFAULT_ALIAS_LENGTH; i++) {
            alias.append(ALPHABET.charAt(secureRandom.nextInt(ALPHABET.length())));
        }
        return alias.toString();
    }
}
