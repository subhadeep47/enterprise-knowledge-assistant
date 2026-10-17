package com.enterprise.assistant.backend.session.repository;

import com.enterprise.assistant.backend.session.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository
        extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findBySession_IdOrderByCreatedAtAsc(
            Long sessionId);
}

