package com.enterprise.assistant.backend.session.controller;

import com.enterprise.assistant.backend.session.dtos.ChatSessionResponse;
import com.enterprise.assistant.backend.session.service.ChatSessionService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat/sessions")
public class ChatSessionController {

    private final ChatSessionService chatSessionService;

    public ChatSessionController(ChatSessionService chatSessionService) {
        this.chatSessionService = chatSessionService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ChatSessionResponse createSession(
            Authentication authentication) {
        return chatSessionService.createSession(
                authentication.getName());
    }

    @GetMapping
    public List<ChatSessionResponse> getSessions(
            Authentication authentication) {
        return chatSessionService.getSessions(
                authentication.getName());
    }
}

