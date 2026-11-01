
package com.enterprise.assistant.backend.knowledge.service;

import java.util.List;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class KeywordSearchService {

    private final JdbcTemplate jdbcTemplate;

    public List<KeywordSearchResult> search(
            String question,
            int topK,
            Long documentId
    ) {
        if (!StringUtils.hasText(question)) {
            throw new IllegalArgumentException(
                    "Search question must not be blank"
            );
        }

        String sql = """
                SELECT
                    id::text AS id,
                    content,
                    metadata ->> 'documentId' AS document_id,
                    metadata ->> 'chunkIndex' AS chunk_index,
                    metadata ->> 'source' AS source,
                    ts_rank_cd(
                        search_vector,
                        plainto_tsquery('english', ?)
                    ) AS keyword_score
                FROM public.vector_store
                WHERE search_vector @@ plainto_tsquery('english', ?)
                """;

        if (documentId != null) {
            sql += " AND metadata ->> 'documentId' = ? ";
        }

        sql += """
                ORDER BY keyword_score DESC
                LIMIT ?
                """;

        List<Object> parameters = new java.util.ArrayList<>();

        parameters.add(question);
        parameters.add(question);

        if (documentId != null) {
            parameters.add(documentId.toString());
        }

        parameters.add(topK);

        List<KeywordSearchResult> results = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new KeywordSearchResult(
                        rs.getString("id"),
                        rs.getString("content"),
                        rs.getString("document_id"),
                        rs.getString("chunk_index"),
                        rs.getString("source"),
                        rs.getDouble("keyword_score")
                ),
                parameters.toArray()
        );

        log.info(
                "Keyword search retrieved {} chunks",
                results.size()
        );

        return results;
    }

    public record KeywordSearchResult(
            String id,
            String content,
            String documentId,
            String chunkIndex,
            String source,
            Double score
    ) {
    }
}
