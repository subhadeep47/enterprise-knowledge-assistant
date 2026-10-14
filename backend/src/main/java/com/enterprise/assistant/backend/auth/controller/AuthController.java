
package com.enterprise.assistant.backend.auth.controller;

import com.enterprise.assistant.backend.auth.service.AuthCookieService;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthCookieService authCookieService;

    public AuthController(AuthCookieService authCookieService) {
        this.authCookieService = authCookieService;
    }

    @GetMapping("/csrf")
    public Map<String, String> getCsrfToken(CsrfToken csrfToken) {
        return Map.of("token", csrfToken.getToken());
    }

    @GetMapping("/me")
    public Map<String, String> getCurrentUser(
            Authentication authentication) {

        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Role must be present for all users"));

        return Map.of(
                "email", authentication.getName(),
                "role", role
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletResponse response) {

        authCookieService.clearAccessTokenCookie(response);

        return ResponseEntity.noContent().build();
    }
}
