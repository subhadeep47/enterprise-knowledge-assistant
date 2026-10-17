package com.enterprise.assistant.backend.session.dtos;

import java.time.Instant;

public record ChatMessageResponse(
        Long id,
        String role,
        String content,
        Instant createdAt
) {
}
