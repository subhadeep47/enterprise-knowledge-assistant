
package com.enterprise.assistant.backend.knowledge.service;

import com.enterprise.assistant.backend.config.SupabaseProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;

@Service
@RequiredArgsConstructor
public class SupabaseStorageService {

    private final SupabaseProperties supabaseProperties;
    private final RestClient.Builder restClientBuilder;

    public void upload(MultipartFile file, String objectPath)
            throws IOException {

        String secretKey = supabaseProperties.getSecretKey();

        if (!StringUtils.hasText(secretKey)) {
            throw new IllegalStateException(
                    "Supabase Storage secret key is not configured");
        }

        RestClient restClient = restClientBuilder.build();

        restClient.post()
                .uri(buildObjectUri(objectPath))
                .headers(headers -> {
                    headers.setBearerAuth(secretKey);
                    headers.set("apikey", secretKey);
                    headers.setContentType(
                            MediaType.parseMediaType(file.getContentType()));
                    headers.set("x-upsert", "false");
                })
                .body(file.getBytes())
                .retrieve()
                .toBodilessEntity();

        // Store this relative object path in knowledge_documents.storage_path.
    }


    public byte[] download(String objectPath) {
        String secretKey = supabaseProperties.getSecretKey();

        if (!StringUtils.hasText(secretKey)) {
            throw new IllegalStateException(
                    "Supabase Storage secret key is not configured");
        }

        return restClientBuilder.build()
                .get()
                .uri(buildObjectUri(objectPath))
                .headers(headers -> {
                    headers.setBearerAuth(secretKey);
                    headers.set("apikey", secretKey);
                })
                .retrieve()
                .body(byte[].class);
    }


    public void delete(String objectPath) {
        String secretKey = supabaseProperties.getSecretKey();

        if (!StringUtils.hasText(secretKey)) {
            throw new IllegalStateException(
                    "Supabase Storage secret key is not configured");
        }

        RestClient restClient = restClientBuilder.build();

        restClient.delete()
                .uri(buildObjectUri(objectPath))
                .headers(headers -> {
                    headers.setBearerAuth(secretKey);
                    headers.set("apikey", secretKey);
                })
                .retrieve()
                .toBodilessEntity();
    }

    private URI buildObjectUri(String objectPath) {
        String baseUrl = supabaseProperties.getUrl();
        String bucket = supabaseProperties.getStorage().getBucket();

        if (!StringUtils.hasText(baseUrl)
                || !StringUtils.hasText(bucket)
                || !StringUtils.hasText(objectPath)) {
            throw new IllegalStateException(
                    "Supabase URL, bucket, and object path must be configured");
        }

        String[] pathSegments = objectPath.split("/");

        return UriComponentsBuilder.fromUriString(baseUrl)
                .pathSegment("storage", "v1", "object", bucket)
                .pathSegment(pathSegments)
                .build()
                .encode()
                .toUri();
    }
}
