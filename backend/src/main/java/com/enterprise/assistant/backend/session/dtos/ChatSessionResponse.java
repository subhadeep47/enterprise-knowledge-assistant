package com.enterprise.assistant.backend.session.dtos;

import java.time.Instant;
import java.util.UUID;

public record ChatSessionResponse(
        Long id,
        String title,
        Instant createdAt,
        Instant updatedAt
) {
}
