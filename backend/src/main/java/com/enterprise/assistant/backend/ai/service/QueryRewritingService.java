package com.enterprise.assistant.backend.ai.service;

import java.util.List;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class QueryRewritingService {

    private final ChatClient.Builder chatClientBuilder;

    private static final String REWRITE_PROMPT = """
        You are a search query rewriting assistant for an
        enterprise knowledge retrieval system.

        Your task is to convert the user's latest question into
        a standalone search query using the conversation history.

        RULES:

        1. Preserve the original intent and meaning of the question.
        2. Resolve references such as "it", "that", "they",
           "what about this", and "what about its exceptions"
           using the conversation history.
        3. Include relevant policy names, subjects, and entities
           when they can be identified from the conversation.
        4. Make the query clear and suitable for semantic search.
        5. Do not answer the question.
        6. Do not introduce facts or assumptions that are not
           present in the original question or conversation history.
        7. If the question is already standalone, return it
           with minimal or no changes.
        8. Return ONLY the rewritten query.
        9. Do not include explanations, headings, or quotation marks.

        The conversation history is provided only to understand
        the user's intent and references.
        """;

    public String rewrite(String question, List<Message> history) {

        if (!StringUtils.hasText(question)) {
            throw new IllegalArgumentException(
                    "Question must not be blank");
        }

        if (history == null || history.isEmpty()) {
            return question;
        }

        try {
            String rewrittenQuery = chatClientBuilder.build()
                    .prompt()
                    .system(REWRITE_PROMPT)
                    .messages(history.toArray(Message[]::new))
                    .call()
                    .content();

            if (!StringUtils.hasText(rewrittenQuery)) {
                log.warn("Query rewriting returned an empty result. Using original query.");
                return question;
            }

            rewrittenQuery = rewrittenQuery.trim();

            log.info("Original query: {}", question);
            log.info("Rewritten query: {}", rewrittenQuery);

            return rewrittenQuery;

        } catch (Exception exception) {
            log.warn(
                    "Query rewriting failed. Falling back to original query.",
                    exception
            );

            return question;
        }
    }
}