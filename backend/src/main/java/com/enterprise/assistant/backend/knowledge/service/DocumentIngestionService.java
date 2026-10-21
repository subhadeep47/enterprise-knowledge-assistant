
package com.enterprise.assistant.backend.knowledge.service;

import com.enterprise.assistant.backend.knowledge.enums.DocumentStatus;
import com.enterprise.assistant.backend.knowledge.model.KnowledgeDocument;
import com.enterprise.assistant.backend.knowledge.repository.KnowledgeDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DocumentIngestionService {

    private final KnowledgeDocumentRepository documentRepository;
    private final DocumentTextExtractionService textExtractionService;
    private final DocumentChunkingService chunkingService;
    private final VectorStore vectorStore;

    public void ingest(Long documentId) {
        KnowledgeDocument document = documentRepository.findById(documentId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Knowledge document not found: " + documentId));

        document.setStatus(DocumentStatus.PROCESSING);
        document.setErrorMessage(null);
        documentRepository.saveAndFlush(document);

        try {
            String extractedText =
                    textExtractionService.extractText(document);

            List<Document> chunks =
                    chunkingService.chunk(extractedText);

            List<Document> enrichedChunks =
                    addMetadata(chunks, document);

            vectorStore.add(enrichedChunks);

            markCompleted(document);

        } catch (Exception exception) {
            markFailed(document, exception);

            throw new DocumentIngestionException(
                    "Ingestion failed for document " + documentId,
                    exception);
        }
    }

    private List<Document> addMetadata(
            List<Document> chunks,
            KnowledgeDocument sourceDocument) {

        List<Document> enriched = new ArrayList<>(chunks.size());

        for (int index = 0; index < chunks.size(); index++) {
            Document chunk = chunks.get(index);

            Map<String, Object> metadata = new HashMap<>(
                    chunk.getMetadata());

            metadata.put("documentId", sourceDocument.getId());
            metadata.put("chunkIndex", index);
            metadata.put("source", sourceDocument.getOriginalFilename());

            enriched.add(new Document(chunk.getText(), metadata));
        }

        return enriched;
    }

    @Transactional
    protected void markCompleted(KnowledgeDocument document) {
        document.setStatus(DocumentStatus.COMPLETED);
        document.setErrorMessage(null);
        documentRepository.save(document);
    }

    @Transactional
    protected void markFailed(
            KnowledgeDocument document,
            Exception exception) {

        String message = exception.getMessage();

        if (!StringUtils.hasText(message)) {
            message = exception.getClass().getSimpleName();
        }

        if (message.length() > 2000) {
            message = message.substring(0, 2000);
        }

        document.setStatus(DocumentStatus.FAILED);
        document.setErrorMessage(message);
        documentRepository.save(document);
    }

    public static class DocumentIngestionException
            extends RuntimeException {

        public DocumentIngestionException(
                String message, Throwable cause) {
            super(message, cause);
        }
    }
}
