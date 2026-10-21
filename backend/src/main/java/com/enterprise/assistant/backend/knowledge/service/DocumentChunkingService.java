
package com.enterprise.assistant.backend.knowledge.service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentChunkingService {

    private final TokenTextSplitter tokenTextSplitter;

    public List<Document> chunk(String text) {
        if (!StringUtils.hasText(text)) {
            throw new IllegalArgumentException(
                    "Text to chunk must not be empty");
        }

        List<Document> chunks =
                tokenTextSplitter.apply(List.of(new Document(text)));

        if (chunks.isEmpty()) {
            throw new IllegalStateException(
                    "No chunks were produced from the extracted text");
        }

        return chunks;
    }
}
