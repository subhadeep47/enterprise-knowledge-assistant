
package com.enterprise.assistant.backend.knowledge.service;

import com.enterprise.assistant.backend.exception.DuplicateDocumentException;
import com.enterprise.assistant.backend.exception.InvalidDocumentException;
import com.enterprise.assistant.backend.knowledge.enums.DocumentStatus;
import com.enterprise.assistant.backend.knowledge.model.KnowledgeDocument;
import com.enterprise.assistant.backend.knowledge.repository.KnowledgeDocumentRepository;
import com.enterprise.assistant.backend.user.model.UserEntity;
import com.enterprise.assistant.backend.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KnowledgeDocumentService {

    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;
    private static final String PDF_CONTENT_TYPE = "application/pdf";

    private final KnowledgeDocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final SupabaseStorageService supabaseStorageService;

    @Transactional
    public KnowledgeDocument upload(MultipartFile file, String email)
            throws IOException {

        validateFile(file);

        UserEntity user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new EntityNotFoundException("User not found"));

        String checksum = calculateChecksum(file);

        if (documentRepository.existsByChecksum(checksum)) {
            throw new DuplicateDocumentException(
                    "This document has already been uploaded");
        }

        String originalFilename = sanitizeFilename(file.getOriginalFilename());
        String objectPath = "knowledge/" + UUID.randomUUID()
                + "/" + originalFilename;

        // Upload the original file first.
        supabaseStorageService.upload(file, objectPath);

        try {
            KnowledgeDocument document = new KnowledgeDocument();
            document.setOriginalFilename(originalFilename);
            document.setStoragePath(objectPath);
            document.setContentType(PDF_CONTENT_TYPE);
            document.setFileSizeBytes(file.getSize());
            document.setChecksum(checksum);
            document.setStatus(DocumentStatus.PENDING);
            document.setUploadedBy(user);

            return documentRepository.saveAndFlush(document);

        } catch (RuntimeException exception) {
            // A database failure must not leave an untracked uploaded file.
            try {
                supabaseStorageService.delete(objectPath);
            } catch (RuntimeException cleanupException) {
                exception.addSuppressed(cleanupException);
            }

            if (exception instanceof DataIntegrityViolationException) {
                throw new DuplicateDocumentException(
                        "This document has already been uploaded");
            }

            throw exception;
        }
    }

    public KnowledgeDocument getById(Long documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() ->
                        new jakarta.persistence.EntityNotFoundException(
                                "Knowledge document not found: " + documentId));
    }


    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidDocumentException(
                    "Please upload a non-empty PDF file");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidDocumentException(
                    "The maximum file size is 10 MB");
        }

        String contentType = file.getContentType();

        if (!PDF_CONTENT_TYPE.equalsIgnoreCase(contentType)) {
            throw new InvalidDocumentException(
                    "Only PDF files are supported");
        }

        String filename = file.getOriginalFilename();

        if (filename == null
                || !filename.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
            throw new InvalidDocumentException(
                    "Only PDF files are supported");
        }

        // The upload service will additionally inspect the actual PDF content.
        try {
            byte[] header = file.getBytes();

            if (header.length < 5
                    || header[0] != '%'
                    || header[1] != 'P'
                    || header[2] != 'D'
                    || header[3] != 'F'
                    || header[4] != '-') {
                throw new InvalidDocumentException(
                        "The uploaded file is not a valid PDF");
            }
        } catch (IOException exception) {
            throw new InvalidDocumentException(
                    "Unable to read the uploaded file");
        }
    }

    private String calculateChecksum(MultipartFile file)
            throws IOException {

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(file.getBytes()));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "SHA-256 is unavailable", exception);
        }
    }

    private String sanitizeFilename(String filename) {
        String cleaned = StringUtils.cleanPath(filename);

        // Remove any directory components supplied by the client.
        int separator = Math.max(
                cleaned.lastIndexOf('/'),
                cleaned.lastIndexOf('\\'));

        cleaned = cleaned.substring(separator + 1).trim();

        if (cleaned.isBlank() || cleaned.length() > 255) {
            throw new InvalidDocumentException(
                    "The filename is invalid or too long");
        }

        return cleaned;
    }
}
