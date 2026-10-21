
package com.enterprise.assistant.backend.knowledge.repository;

import com.enterprise.assistant.backend.knowledge.enums.DocumentStatus;
import com.enterprise.assistant.backend.knowledge.model.KnowledgeDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface KnowledgeDocumentRepository
        extends JpaRepository<KnowledgeDocument, Long> {

    List<KnowledgeDocument> findAllByOrderByCreatedAtDesc();

    List<KnowledgeDocument> findByStatusOrderByCreatedAtAsc(
            DocumentStatus status);

    boolean existsByChecksum(String checksum);

    Optional<KnowledgeDocument> findByChecksum(String checksum);

}
