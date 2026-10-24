
package com.enterprise.assistant.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidDocumentException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidDocument(
            InvalidDocumentException ex,
            HttpServletRequest request) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                ex.getMessage(),
                request.getRequestURI());
    }

    @ExceptionHandler(DuplicateDocumentException.class)
    public ResponseEntity<ApiErrorResponse> handleDuplicateDocument(
            DuplicateDocumentException ex,
            HttpServletRequest request) {

        return buildResponse(
                HttpStatus.CONFLICT,
                ex.getMessage(),
                request.getRequestURI());
    }

    @ExceptionHandler(DocumentIngestionException.class)
    public ResponseEntity<ApiErrorResponse> handleDocumentIngestion(
            DocumentIngestionException ex,
            HttpServletRequest request) {

        log.error("Document ingestion failed", ex);

        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "The document was uploaded, but ingestion failed.",
                request.getRequestURI());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpectedException(
            Exception ex,
            HttpServletRequest request) {

        log.error("Unexpected API error for {}", request.getRequestURI(), ex);

        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred.",
                request.getRequestURI());
    }

    private ResponseEntity<ApiErrorResponse> buildResponse(
            HttpStatus status,
            String message,
            String path) {

        ApiErrorResponse body = new ApiErrorResponse(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                path);

        return ResponseEntity.status(status).body(body);
    }
}
