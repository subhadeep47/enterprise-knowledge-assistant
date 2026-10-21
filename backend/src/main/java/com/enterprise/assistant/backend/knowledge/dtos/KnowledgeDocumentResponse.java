
package com.enterprise.assistant.backend.knowledge.dtos;

import com.enterprise.assistant.backend.knowledge.model.KnowledgeDocument;

import java.time.Instant;

public record KnowledgeDocumentResponse(
        Long id,
        String originalFilename,
        String status,
        Long fileSizeBytes,
        Instant createdAt
) {
    public static KnowledgeDocumentResponse from(
            KnowledgeDocument document) {
        return new KnowledgeDocumentResponse(
                document.getId(),
                document.getOriginalFilename(),
                document.getStatus().name(),
                document.getFileSizeBytes(),
                document.getCreatedAt()
        );
    }
}
