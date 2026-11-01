
package com.enterprise.assistant.backend.knowledge.service;

import java.util.HashMap;
import java.util.LinkedHashMap;
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
    private static final int RRF_K = 60;

    @Value("${app.retrieval.similarity-threshold:0.0}")
    private double similarityThreshold;

    private final VectorStore vectorStore;
    private final KeywordSearchService keywordSearchService;

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
                    "Search question must not be blank"
            );
        }

        if (topK < 1 || topK > MAX_TOP_K) {
            throw new IllegalArgumentException(
                    "topK must be between 1 and " + MAX_TOP_K
            );
        }

        // 1. Semantic search
        List<Document> semanticResults =
                semanticSearch(question, topK, documentId);

        // 2. Keyword search
        List<KeywordSearchService.KeywordSearchResult> keywordResults =
                keywordSearchService.search(question, topK, documentId);

        // 3. Reciprocal Rank Fusion
        List<RetrievedChunk> fusedResults =
                reciprocalRankFusion(semanticResults, keywordResults, topK);

        log.info(
                "Hybrid retrieval completed. Semantic={}, Keyword={}, Fused={}",
                semanticResults.size(),
                keywordResults.size(),
                fusedResults.size()
        );

        fusedResults.forEach(chunk -> log.info(
                "Hybrid result: source={}, documentId={}, chunkIndex={}, rrfScore={}",
                chunk.source(),
                chunk.documentId(),
                chunk.chunkIndex(),
                chunk.score()
        ));

        return fusedResults;
    }

    private List<Document> semanticSearch(
            String question,
            int topK,
            Long documentId
    ) {
        SearchRequest.Builder searchBuilder = SearchRequest.builder()
                .query(question)
                .topK(topK)
                .similarityThreshold(similarityThreshold);

        if (documentId != null) {
            searchBuilder.filterExpression(
                    "documentId == " + documentId
            );
        }

        List<Document> results =
                vectorStore.similaritySearch(searchBuilder.build());

        return results == null ? List.of() : results;
    }

    private List<RetrievedChunk> reciprocalRankFusion(
            List<Document> semanticResults,
            List<KeywordSearchService.KeywordSearchResult> keywordResults,
            int topK
    ) {
        Map<String, RetrievedChunk> chunksById = new LinkedHashMap<>();
        Map<String, Double> scoresById = new HashMap<>();

        // Add semantic search rankings
        for (int i = 0; i < semanticResults.size(); i++) {
            Document document = semanticResults.get(i);

            String id = document.getId();

            RetrievedChunk chunk = toRetrievedChunk(document);

            chunksById.putIfAbsent(id, chunk);

            addRrfScore(scoresById, id, i + 1);
        }

        // Add keyword search rankings
        for (int i = 0; i < keywordResults.size(); i++) {
            KeywordSearchService.KeywordSearchResult result =
                    keywordResults.get(i);

            String id = result.id();

            RetrievedChunk chunk = new RetrievedChunk(
                    result.content(),
                    result.documentId(),
                    result.chunkIndex(),
                    result.source(),
                    null
            );

            chunksById.putIfAbsent(id, chunk);

            addRrfScore(scoresById, id, i + 1);
        }

        // Sort by combined RRF score and return top K
        return scoresById.entrySet()
                .stream()
                .sorted(Map.Entry.<String, Double>comparingByValue()
                        .reversed())
                .limit(topK)
                .map(entry -> {
                    RetrievedChunk chunk =
                            chunksById.get(entry.getKey());

                    return new RetrievedChunk(
                            chunk.content(),
                            chunk.documentId(),
                            chunk.chunkIndex(),
                            chunk.source(),
                            entry.getValue()
                    );
                })
                .toList();
    }

    private void addRrfScore(
            Map<String, Double> scores,
            String id,
            int rank
    ) {
        double rrfScore = 1.0 / (RRF_K + rank);

        scores.merge(id, rrfScore, Double::sum);
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
