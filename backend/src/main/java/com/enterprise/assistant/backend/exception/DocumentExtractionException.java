package com.enterprise.assistant.backend.exception;

public class DocumentExtractionException
        extends RuntimeException {

    public DocumentExtractionException(String message) {
        super(message);
    }

    public DocumentExtractionException(
            String message, Throwable cause) {
        super(message, cause);
    }
}
