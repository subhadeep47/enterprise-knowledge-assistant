
package com.enterprise.assistant.backend.knowledge.service;

import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class KnowledgeRetrievalService {

    private static final int DEFAULT_TOP_K = 5;
    private static final int MAX_TOP_K = 10;

    private final VectorStore vectorStore;

    public List<RetrievedChunk> retrieve(String question) {
        return retrieve(question, DEFAULT_TOP_K);
    }

    public List<RetrievedChunk> retrieve(String question, int topK) {
        if (!StringUtils.hasText(question)) {
            throw new IllegalArgumentException(
                    "Search question must not be blank");
        }

        if (topK < 1 || topK > MAX_TOP_K) {
            throw new IllegalArgumentException(
                    "topK must be between 1 and " + MAX_TOP_K);
        }

        SearchRequest searchRequest = SearchRequest.builder()
                .query(question)
                .topK(topK)
                .build();

        List<Document> documents =
                vectorStore.similaritySearch(searchRequest);

        if (documents == null || documents.isEmpty()) {
            return List.of();
        }

        return documents.stream()
                .map(this::toRetrievedChunk)
                .toList();
    }

    private RetrievedChunk toRetrievedChunk(Document document) {
        Map<String, Object> metadata = document.getMetadata();

        return new RetrievedChunk(
                document.getText(),
                metadata.get("documentId"),
                metadata.get("chunkIndex"),
                metadata.get("source")
        );
    }

    public record RetrievedChunk(
            String content,
            Object documentId,
            Object chunkIndex,
            Object source
    ) {
    }
}
