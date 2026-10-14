
package com.enterprise.assistant.backend.user.service;

import com.enterprise.assistant.backend.user.model.UserEntity;
import com.enterprise.assistant.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

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
                .orElseGet(() -> userRepository
                        .findByEmailIgnoreCase(normalizedEmail)
                        .orElseGet(UserEntity::new));

        user.setGoogleSubject(googleSubject);
        user.setEmail(normalizedEmail);
        user.setFullName(fullName);
        user.setPictureUrl(pictureUrl);

        return userRepository.save(user);
    }
}
