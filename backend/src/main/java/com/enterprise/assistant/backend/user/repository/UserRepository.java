package com.enterprise.assistant.backend.user.repository;

import com.enterprise.assistant.backend.user.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByGoogleSubject(String googleSubject);

    Optional<UserEntity> findByEmailIgnoreCase(String email);
}
