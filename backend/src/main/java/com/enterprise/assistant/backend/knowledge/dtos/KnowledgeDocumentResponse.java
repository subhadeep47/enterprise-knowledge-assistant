
package com.enterprise.assistant.backend.knowledge.dtos;

import com.enterprise.assistant.backend.knowledge.model.KnowledgeDocument;

import java.time.Instant;

public record KnowledgeDocumentResponse(
        Long id,
        String originalFilename,
        String status,
        Long fileSizeBytes,
        Instant createdAt,
        String contentType,
        String errorMessage,
        UploadedByResponse uploadedBy,
        Instant updatedAt
) {
    public static KnowledgeDocumentResponse from(
            KnowledgeDocument document) {
        var uploader = document.getUploadedBy();
        return new KnowledgeDocumentResponse(
                document.getId(),
                document.getOriginalFilename(),
                document.getStatus().name(),
                document.getFileSizeBytes(),
                document.getCreatedAt(),
                document.getContentType(),
                document.getErrorMessage(),
                new UploadedByResponse(
                        uploader.getFullName() == null
                                ? uploader.getEmail()
                                : uploader.getFullName(),
                        uploader.getEmail()
                ),
                document.getUpdatedAt()
        );
    }

    public record UploadedByResponse(String name, String email) {
    }
}
