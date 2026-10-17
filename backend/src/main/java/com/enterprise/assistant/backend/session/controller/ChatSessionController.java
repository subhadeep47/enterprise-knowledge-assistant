package com.enterprise.assistant.backend.session.controller;

import com.enterprise.assistant.backend.session.dtos.ChatSessionResponse;
import com.enterprise.assistant.backend.session.service.ChatSessionService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat/sessions")
@RequiredArgsConstructor
public class ChatSessionController {

    private final ChatSessionService chatSessionService;

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

