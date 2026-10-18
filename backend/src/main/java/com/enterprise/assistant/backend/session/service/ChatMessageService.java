
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

import lombok.RequiredArgsConstructor;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final UserRepository userRepository;
    private final ChatClient.Builder chatClientBuilder;

    private final String SYSTEM_PROMPT = """
                        You are an enterprise knowledge and support assistant.
                        Be helpful, accurate, and professional.
                        If you do not know an answer, say so honestly.
                        Do not invent company policies or internal information.
                        """;

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

    public ChatMessageResponse sendMessage(
            Long sessionId,
            String email,
            SendMessageRequest request) {

        UserEntity user = findUser(email);
        ChatSession session = findOwnedSession(sessionId, user.getId());
        String content = request.content().trim();

        if(session.getTitle().equalsIgnoreCase("New conversation")){
            if (content.length() <= 20) {
                session.setTitle(content.substring(0, 20));
            } else {
                session.setTitle(content.substring(0, 17) + "...");
            }
        }

        // 1. Persist the user's message first.
        ChatMessage userMessage = new ChatMessage();
        userMessage.setSession(session);
        userMessage.setRole(MessageRole.USER);
        userMessage.setContent(content);

        chatMessageRepository.save(userMessage);

        // 2. Load conversation history, including the new message.
        List<Message> history = chatMessageRepository
                .findBySession_IdOrderByCreatedAtAsc(session.getId())
                .stream()
                .map(this::toAiMessage)
                .toList();

        // 3. Generate a response using Spring AI.
        ChatClient chatClient = chatClientBuilder.build();

        String answer = chatClient.prompt()
                .system(SYSTEM_PROMPT)
                .messages(history.toArray(Message[]::new))
                .call()
                .content();

        if (answer == null || answer.isBlank()) {
            throw new IllegalStateException(
                    "The AI model returned an empty response");
        }

        // 4. Persist the assistant's response.
        ChatMessage assistantMessage = new ChatMessage();
        assistantMessage.setSession(session);
        assistantMessage.setRole(MessageRole.ASSISTANT);
        assistantMessage.setContent(answer);

        ChatMessage savedAssistant =
                chatMessageRepository.save(assistantMessage);

        // 5. Update the session's last-modified time.
        session.setUpdatedAt(Instant.now());
        chatSessionRepository.save(session);

        return toResponse(savedAssistant);
    }

    private UserEntity findUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));
    }

    private ChatSession findOwnedSession(Long sessionId, Long userId) {
        return chatSessionRepository
                .findByIdAndUser_Id(sessionId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Chat session not found"));
    }

    private Message toAiMessage(ChatMessage message) {
        return switch (message.getRole()) {
            case USER -> new UserMessage(message.getContent());
            case ASSISTANT -> new AssistantMessage(message.getContent());
            case TOOL -> throw new IllegalStateException(
                    "Tool messages are not supported yet");
        };
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
