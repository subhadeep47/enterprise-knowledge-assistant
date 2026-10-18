package com.enterprise.assistant.backend.session.service;

import com.enterprise.assistant.backend.session.dtos.ChatSessionResponse;
import com.enterprise.assistant.backend.session.model.ChatSession;
import com.enterprise.assistant.backend.session.repository.ChatSessionRepository;
import com.enterprise.assistant.backend.user.model.UserEntity;
import com.enterprise.assistant.backend.user.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatSessionService {

    private final ChatSessionRepository chatSessionRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChatSessionResponse createSession(String email) {
        UserEntity user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new EntityNotFoundException("User not found"));

        ChatSession session = new ChatSession();
        session.setUser(user);
        session.setTitle("New conversation"); //during session creation, will update with first user message.

        ChatSession saved = chatSessionRepository.save(session);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ChatSessionResponse> getSessions(String email) {
        UserEntity user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new EntityNotFoundException("User not found"));

        return chatSessionRepository
                .findByUser_IdAndArchivedFalseOrderByUpdatedAtDesc(
                        user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ChatSessionResponse toResponse(ChatSession session) {
        return new ChatSessionResponse(
                session.getId(),
                session.getTitle(),
                session.getCreatedAt(),
                session.getUpdatedAt()
        );
    }
}

