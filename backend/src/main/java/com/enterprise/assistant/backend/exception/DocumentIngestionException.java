package com.enterprise.assistant.backend.exception;

public class DocumentIngestionException
        extends RuntimeException {

    public DocumentIngestionException(
            String message, Throwable cause) {
        super(message, cause);
    }
}
