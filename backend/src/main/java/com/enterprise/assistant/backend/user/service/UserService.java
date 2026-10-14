
package com.enterprise.assistant.backend.user.service;

import com.enterprise.assistant.backend.user.enums.UserRole;
import com.enterprise.assistant.backend.user.model.UserEntity;
import com.enterprise.assistant.backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    @Value("${app.security.admin-email}")
    String adminEmail;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public UserEntity createOrUpdateGoogleUser(
            String googleSubject,
            String email,
            String fullName,
            String pictureUrl) {

        if (googleSubject == null || googleSubject.isBlank()
                || email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Google subject and email are required"
            );
        }

        String normalizedEmail = email.trim().toLowerCase();

        UserEntity user = userRepository
                .findByGoogleSubject(googleSubject)
                .orElse(null);

        if (user == null) {
            user = new UserEntity();
            user.setGoogleSubject(googleSubject);
            user.setEmail(normalizedEmail);

            UserRole role = normalizedEmail.equalsIgnoreCase(adminEmail)
                    ? UserRole.ADMIN
                    : UserRole.EMPLOYEE;

            user.setRole(role);
        }

        // Update profile fields for existing users.
        user.setFullName(fullName);
        user.setPictureUrl(pictureUrl);

        return userRepository.save(user);
    }
}
