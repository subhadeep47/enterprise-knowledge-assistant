package com.enterprise.assistant.backend.exception;

public class InvalidDocumentException
        extends RuntimeException {
  public InvalidDocumentException(String message) {
    super(message);
  }
}