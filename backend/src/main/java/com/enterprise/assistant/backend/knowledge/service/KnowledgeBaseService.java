
package com.enterprise.assistant.backend.knowledge.service;

import com.enterprise.assistant.backend.exception.DocumentIngestionException;
import com.enterprise.assistant.backend.knowledge.dtos.KnowledgeDocumentResponse;
import com.enterprise.assistant.backend.knowledge.model.KnowledgeDocument;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class KnowledgeBaseService {

    private final KnowledgeDocumentService knowledgeDocumentService;
    private final DocumentIngestionService documentIngestionService;

    public KnowledgeDocumentResponse uploadAndIngest(
            MultipartFile file, String email) throws IOException {

        // 1. Upload the PDF and persist its metadata.
        KnowledgeDocument document =
                knowledgeDocumentService.upload(file, email);

        // 2. Process the uploaded document.
        // Ingestion failures are reflected in the document status.
        documentIngestionService.ingest(document.getId());

        // 3. Return the latest persisted status.
        KnowledgeDocument latestDocument =
                knowledgeDocumentService.getById(document.getId());

        return KnowledgeDocumentResponse.from(latestDocument);
    }
}
