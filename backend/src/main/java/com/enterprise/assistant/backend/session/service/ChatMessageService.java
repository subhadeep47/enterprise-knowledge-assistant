package com.enterprise.assistant.backend.session.service;

import com.enterprise.assistant.backend.session.dtos.ChatMessageResponse;
import com.enterprise.assistant.backend.session.dtos.SendMessageRequest;
import com.enterprise.assistant.backend.session.enums.MessageRole;
import com.enterprise.assistant.backend.session.model.ChatMessage;
import com.enterprise.assistant.backend.session.model.ChatSession;
import com.enterprise.assistant.backend.session.repository.ChatMessageRepository;
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
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(
            Long sessionId, String email) {

        UserEntity user = findUser(email);
        ChatSession session = findOwnedSession(sessionId, user.getId());

        return chatMessageRepository
                .findBySession_IdOrderByCreatedAtAsc(session.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ChatMessageResponse saveUserMessage(
            Long sessionId, String email, SendMessageRequest request) {

        UserEntity user = findUser(email);
        ChatSession session = findOwnedSession(sessionId, user.getId());

        ChatMessage message = new ChatMessage();
        message.setSession(session);
        message.setRole(MessageRole.USER);
        message.setContent(request.content().trim());

        ChatMessage saved = chatMessageRepository.save(message);

        return toResponse(saved);
    }

    private UserEntity findUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new EntityNotFoundException("User not found"));
    }

    private ChatSession findOwnedSession(Long sessionId, Long userId) {
        return chatSessionRepository
                .findByIdAndUser_Id(sessionId, userId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Chat session not found"));
    }

    private ChatMessageResponse toResponse(ChatMessage message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getRole().name(),
                message.getContent(),
                message.getCreatedAt()
        );
    }
}
