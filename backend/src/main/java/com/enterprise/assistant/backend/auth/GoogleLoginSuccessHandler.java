
package com.enterprise.assistant.backend.auth;


import com.enterprise.assistant.backend.auth.service.JwtService;
import com.enterprise.assistant.backend.user.model.UserEntity;
import com.enterprise.assistant.backend.user.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class GoogleLoginSuccessHandler
        implements AuthenticationSuccessHandler {

    private final UserService userService;
    private final JwtService jwtService;
    private final AuthCookieService authCookieService;
    private final String frontendUrl;

    public GoogleLoginSuccessHandler(
            UserService userService,
            JwtService jwtService,
            AuthCookieService authCookieService,
            @Value("${app.frontend-url}") String frontendUrl) {

        this.userService = userService;
        this.jwtService = jwtService;
        this.authCookieService = authCookieService;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication)
            throws IOException, ServletException {

        if (!(authentication.getPrincipal() instanceof OidcUser oidcUser)) {
            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Expected an OpenID Connect user"
            );
            return;
        }

        String googleSubject = oidcUser.getSubject();
        String email = oidcUser.getEmail();

        // Require a verified email from Google's OIDC identity.
        Boolean emailVerified =
                oidcUser.getClaimAsBoolean("email_verified");

        if (email == null || !Boolean.TRUE.equals(emailVerified)) {
            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "A verified Google email is required"
            );
            return;
        }

        // Persist the user before issuing our application's token.
        UserEntity user = userService.createOrUpdateGoogleUser(
                googleSubject,
                email,
                oidcUser.getFullName(),
                oidcUser.getPicture()
        );

        String jwt = jwtService.generateToken(user.getEmail());

        authCookieService.addAccessTokenCookie(
                response,
                jwt,
                jwtService.getExpirationMs()
        );

        // No JWT is placed in the redirect URL.
        response.sendRedirect(frontendUrl);
    }
}
