package com.enterprise.assistant.backend.session.controller;

import com.enterprise.assistant.backend.session.dtos.ChatMessageResponse;
import com.enterprise.assistant.backend.session.dtos.SendMessageRequest;
import com.enterprise.assistant.backend.session.service.ChatMessageService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat/sessions/{sessionId}/messages")
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    public ChatMessageController(ChatMessageService chatMessageService) {
        this.chatMessageService = chatMessageService;
    }

    @GetMapping
    public List<ChatMessageResponse> getMessages(
            @PathVariable Long sessionId,
            Authentication authentication) {

        return chatMessageService.getMessages(
                sessionId, authentication.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ChatMessageResponse sendMessage(
            @PathVariable Long sessionId,
            @Valid @RequestBody SendMessageRequest request,
            Authentication authentication) {

        return chatMessageService.sendMessage(
                sessionId, authentication.getName(), request);
    }
}
