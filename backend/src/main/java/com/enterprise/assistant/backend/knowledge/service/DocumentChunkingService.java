
package com.enterprise.assistant.backend.knowledge.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class DocumentChunkingService {

    // Approximate starting points
    private static final int TARGET_CHUNK_CHARS = 3500;
    private static final int OVERLAP_CHARS = 450;
    private static final int MIN_CHUNK_CHARS = 100;

    public List<Document> chunk(String text) {
        if (!StringUtils.hasText(text)) {
            throw new IllegalArgumentException(
                    "Text to chunk must not be empty");
        }

        String normalized = text
                .replace("\r\n", "\n")
                .replace('\r', '\n')
                .trim();

        List<Document> chunks = new ArrayList<>();
        int start = 0;
        int textLength = normalized.length();

        while (start < textLength) {
            int end = Math.min(
                    start + TARGET_CHUNK_CHARS,
                    textLength
            );

            if (end < textLength) {
                end = findBoundary(normalized, start, end);
            }

            String chunkText = normalized.substring(start, end).trim();

            if (chunkText.length() >= MIN_CHUNK_CHARS
                    || chunks.isEmpty()) {
                if (StringUtils.hasText(chunkText)) {
                    chunks.add(new Document(chunkText));
                }
            }

            if (end >= textLength) {
                break;
            }

            // Move backwards to retain context from the previous chunk.
            int nextStart = Math.max(0, end - OVERLAP_CHARS);

            // Avoid getting stuck if a boundary is unusually small.
            start = Math.max(nextStart, start + 1);
        }

        if (chunks.isEmpty()) {
            throw new IllegalStateException(
                    "No chunks were produced from the extracted text");
        }

        return chunks;
    }

    private int findBoundary(String text, int start, int targetEnd) {
        int minimumEnd = start
                + (int) (TARGET_CHUNK_CHARS * 0.70);

        int paragraphBoundary = text.lastIndexOf(
                "\n\n", targetEnd);

        if (paragraphBoundary >= minimumEnd) {
            return paragraphBoundary;
        }

        int lineBoundary = text.lastIndexOf(
                '\n', targetEnd);

        if (lineBoundary >= minimumEnd) {
            return lineBoundary;
        }

        int wordBoundary = text.lastIndexOf(
                ' ', targetEnd);

        if (wordBoundary >= minimumEnd) {
            return wordBoundary;
        }

        return targetEnd;
    }
}
