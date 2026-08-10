package com.example.backendjevanready.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backendjevanready.Repository.UserRepository;
import com.example.backendjevanready.Entity.User;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 1. REGISTER ENDPOINT (For new first-time users)
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User userRequest) {
        // Check if user already exists
        Optional<User> existingUserOpt = userRepository.findByEmail(userRequest.getEmail());
        if (existingUserOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("An account with this email already exists!");
        }

        // Save new user to Postgres DB
        User savedUser = userRepository.save(userRequest);
        return ResponseEntity.ok(savedUser);
    }

    // 2. LOGIN ENDPOINT (For existing users)
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User userRequest) {
        Optional<User> existingUserOpt = userRepository.findByEmail(userRequest.getEmail());

        if (existingUserOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Account not found. Please create an account first.");
        }

        User user = existingUserOpt.get();

        // Check password match (simple check for basic setup)
        if (userRequest.getPassword() != null && !userRequest.getPassword().equals(user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials! Incorrect password.");
        }

        return ResponseEntity.ok(user);
    }
}