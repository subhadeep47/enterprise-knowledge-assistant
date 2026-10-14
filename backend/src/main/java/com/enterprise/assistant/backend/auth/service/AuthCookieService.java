
package com.enterprise.assistant.backend.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletResponse;

import java.time.Duration;

@Service
public class AuthCookieService {

    public static final String ACCESS_TOKEN_COOKIE = "ACCESS_TOKEN";

    private final boolean secure;
    private final String sameSite;

    public AuthCookieService(
            @Value("${app.cookie.secure}") boolean secure,
            @Value("${app.cookie.same-site}") String sameSite) {

        if (!"Lax".equalsIgnoreCase(sameSite)
                && !"Strict".equalsIgnoreCase(sameSite)
                && !"None".equalsIgnoreCase(sameSite)) {
            throw new IllegalArgumentException(
                    "Cookie SameSite must be Lax, Strict, or None"
            );
        }

        if ("None".equalsIgnoreCase(sameSite) && !secure) {
            throw new IllegalArgumentException(
                    "SameSite=None requires Secure=true"
            );
        }

        this.secure = secure;
        this.sameSite = sameSite;
    }

    public void addAccessTokenCookie(
            HttpServletResponse response,
            String token,
            long maxAgeMs) {

        ResponseCookie cookie = ResponseCookie
                .from(ACCESS_TOKEN_COOKIE, token)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(Duration.ofMillis(maxAgeMs))
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public void clearAccessTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie
                .from(ACCESS_TOKEN_COOKIE, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
