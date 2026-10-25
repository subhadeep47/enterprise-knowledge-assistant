
package com.enterprise.assistant.backend.knowledge.service;

import com.enterprise.assistant.backend.exception.DocumentExtractionException;
import com.enterprise.assistant.backend.knowledge.model.KnowledgeDocument;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class DocumentTextExtractionService {

    private static final Pattern WHITESPACE =
            Pattern.compile("[\\t\\x0B\\f\\r ]+");

    private final SupabaseStorageService storageService;

    public String extractText(KnowledgeDocument document) {
        byte[] pdfBytes =
                storageService.download(document.getStoragePath());

        if (pdfBytes == null || pdfBytes.length == 0) {
            throw new DocumentExtractionException(
                    "The stored PDF is empty");
        }

        try (PDDocument pdf = Loader.loadPDF(pdfBytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String extractedText = stripper.getText(pdf);

            // Normalize whitespace while retaining paragraph boundaries.
            extractedText = extractedText
                    .replace("\r\n", "\n")
                    .replace('\r', '\n')
                    .replaceAll("[\\t\\x0B\\f ]+", " ")
                    .replaceAll(" *\\n *", "\n")
                    .replaceAll("\\n{3,}", "\n\n")
                    .trim();

            StringBuilder normalized = new StringBuilder();

            for (String line : extractedText.split("\n")) {
                String cleaned = WHITESPACE
                        .matcher(line)
                        .replaceAll(" ")
                        .trim();

                if (!cleaned.isEmpty()) {
                    if (!normalized.isEmpty()) {
                        normalized.append('\n');
                    }
                    normalized.append(cleaned);
                }
            }

            String result = normalized.toString().trim();

            if (!StringUtils.hasText(result)) {
                throw new DocumentExtractionException(
                        "No extractable text found. "
                                + "The PDF may be scanned or image-only.");
            }

            return result;

        } catch (IOException exception) {
            throw new DocumentExtractionException(
                    "Unable to parse the uploaded PDF", exception);
        }
    }
}
