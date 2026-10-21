package com.enterprise.assistant.backend.exception;

public class DuplicateDocumentException
        extends RuntimeException {
    public DuplicateDocumentException(String message) {
        super(message);
    }
}
