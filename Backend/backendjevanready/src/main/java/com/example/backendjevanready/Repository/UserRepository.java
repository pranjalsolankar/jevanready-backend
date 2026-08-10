package com.example.backendjevanready.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backendjevanready.Entity.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}