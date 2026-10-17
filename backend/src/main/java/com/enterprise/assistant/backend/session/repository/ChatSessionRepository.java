package com.enterprise.assistant.backend.session.repository;

import com.enterprise.assistant.backend.session.model.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatSessionRepository
        extends JpaRepository<ChatSession, Long> {

    List<ChatSession> findByUser_IdAndArchivedFalseOrderByUpdatedAtDesc(
            Long userId);

    Optional<ChatSession> findByIdAndUser_Id(
            Long sessionId, Long userId);
}

