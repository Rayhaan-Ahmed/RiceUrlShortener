package edu.rice.atlink.backend.exception;

public class LinkNotFoundException extends RuntimeException {

    public LinkNotFoundException(String alias) {
        super("Alias not found: " + alias);
    }
}
