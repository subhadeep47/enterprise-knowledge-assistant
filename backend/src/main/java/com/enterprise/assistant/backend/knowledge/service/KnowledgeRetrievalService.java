
package com.enterprise.assistant.backend.knowledge.service;

import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class KnowledgeRetrievalService {

    private static final int DEFAULT_TOP_K = 5;
    private static final int MAX_TOP_K = 10;

    @Value("${app.retrieval.similarity-threshold:0.0}")
    private double similarityThreshold;

    private final VectorStore vectorStore;

    public List<RetrievedChunk> retrieve(String question) {
        return retrieve(question, DEFAULT_TOP_K, null);
    }

    public List<RetrievedChunk> retrieve(String question, int topK) {
        return retrieve(question, topK, null);
    }

    public List<RetrievedChunk> retrieve(
            String question,
            int topK,
            Long documentId
    ) {
        if (!StringUtils.hasText(question)) {
            throw new IllegalArgumentException(
                    "Search question must not be blank");
        }

        if (topK < 1 || topK > MAX_TOP_K) {
            throw new IllegalArgumentException(
                    "topK must be between 1 and " + MAX_TOP_K);
        }

        SearchRequest.Builder searchBuilder = SearchRequest.builder()
                .query(question)
                .topK(topK)
                .similarityThreshold(similarityThreshold);

        if (documentId != null) {
            searchBuilder.filterExpression(
                    "documentId == " + documentId
            );
        }

        SearchRequest searchRequest = searchBuilder.build();

        List<Document> documents =
                vectorStore.similaritySearch(searchRequest);

        if (documents == null || documents.isEmpty()) {
            log.info("No chunks retrieved for the question");
            return List.of();
        }

        List<RetrievedChunk> chunks = documents.stream()
                .map(this::toRetrievedChunk)
                .toList();

        log.info("Retrieved {} chunks", chunks.size());

        chunks.forEach(chunk -> log.info(
                "Retrieved source={}, documentId={}, chunkIndex={}, score={}",
                chunk.source(),
                chunk.documentId(),
                chunk.chunkIndex(),
                chunk.score()
        ));

        return chunks;
    }

    private RetrievedChunk toRetrievedChunk(Document document) {
        Map<String, Object> metadata = document.getMetadata();

        return new RetrievedChunk(
                document.getText(),
                metadata.get("documentId"),
                metadata.get("chunkIndex"),
                metadata.get("source"),
                document.getScore()
        );
    }

    public record RetrievedChunk(
            String content,
            Object documentId,
            Object chunkIndex,
            Object source,
            Double score
    ) {
    }
}
