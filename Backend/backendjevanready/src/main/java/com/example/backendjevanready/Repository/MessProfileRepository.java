package com.example.backendjevanready.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backendjevanready.Entity.MessProfile;

import java.util.Optional;

public interface MessProfileRepository extends JpaRepository<MessProfile, Long> {
    Optional<MessProfile> findByOwnerEmail(String ownerEmail);
    Optional<MessProfile> findByMessName(String messName);
}