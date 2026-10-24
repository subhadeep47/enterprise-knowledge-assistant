
package com.enterprise.assistant.backend.knowledge.controller;

import com.enterprise.assistant.backend.knowledge.dtos.KnowledgeDocumentResponse;
import com.enterprise.assistant.backend.knowledge.service.KnowledgeBaseService;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/admin/knowledge-base")
@RequiredArgsConstructor
@Validated
public class KnowledgeDocumentController {

    private final KnowledgeBaseService knowledgeBaseService;

    @PostMapping(consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public List<KnowledgeDocumentResponse> uploadDocuments(
            @RequestParam("files") @NotEmpty MultipartFile[] files,
            Authentication authentication) {

        if (files.length == 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "At least one file is required");
        }

        return Arrays.stream(files)
                .map(file -> uploadSingleFile(file, authentication.getName()))
                .toList();
    }

    private KnowledgeDocumentResponse uploadSingleFile(
            MultipartFile file, String email) {

        try {
            return knowledgeBaseService.uploadAndIngest(file, email);

        } catch (IOException ex) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to store the uploaded document", ex);
        }
    }
}
