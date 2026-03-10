package edu.rice.atlink.backend.exception;

public class LinkExpiredException extends RuntimeException {

    public LinkExpiredException(String alias) {
        super("Link has expired: " + alias);
    }
}
